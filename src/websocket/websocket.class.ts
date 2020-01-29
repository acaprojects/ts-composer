import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import {
    EngineCommandRequest,
    EngineCommandRequestMetadata,
    EngineDebugEvent,
    EngineErrorCodes,
    EngineExecRequestOptions,
    EngineLogLevel,
    EngineRequestOptions,
    EngineResponse,
    EngineWebsocketOptions,
    SimpleNetworkError
} from './websocket.interfaces';

import { engine, EngineAuthService } from '../auth/auth.service';
import { log } from '../utilities/general.utilities';

/** Time in seconds to ping the server to keep the websocket connection alive */
const KEEP_ALIVE = 20;
/** Global counter for websocket request IDs */
let REQUEST_COUNT = 0;

/**
 * Method store to allow attaching spies for testing
 * @hidden
 */
export let engine_socket = { websocket: webSocket, log };

export class EngineWebsocket {
    /** Listener for debugging events */
    public readonly debug_events = new Subject<EngineDebugEvent>();
    /** Websocket for connecting to engine */
    protected websocket: WebSocketSubject<any> | undefined;
    /** Request promises */
    protected requests: { [id: string]: EngineCommandRequestMetadata } = {};
    /** Subjects for listening to values of bindings */
    protected binding: { [id: string]: BehaviorSubject<any> } = {};
    /** Observers for the binding subjects */
    protected observers: { [id: string]: Observable<any> } = {};
    /** Request responders */
    protected promise_callbacks: {
        [id: string]: { resolve: (_?: any) => void; reject: (_?: any) => void };
    } = {};
    /** Interval ID for the server ping callback */
    protected keep_alive: number | undefined;
    /** BehaviorSubject holding the connection status of the websocket */
    protected _status = new BehaviorSubject<boolean>(false);
    /** Observable fo the connection status subject value */
    protected _status_obs = this._status.asObservable();
    /** Subscription to the online state of the auth service when reconnecting */
    private _online_sub: Subscription | undefined;
    /** Number of connection attempts made before the session is established */
    private _connection_attempts: number = 0;
    /** Timer to check the initial health of the websocket connection */
    private _health_check: number | undefined;
    /** Timer for waiting to retry connections */
    private _retry_timer: number | undefined;

    constructor(protected auth: EngineAuthService, protected options: EngineWebsocketOptions) {
        REQUEST_COUNT = 0;
        this.connect();
    }

    public get route() {
        return this.auth.api_endpoint.indexOf('control') >= 0
            ? '/control/websocket'
            : `${this.auth.route}/systems/control`;
    }

    /** Whether the websocket is connected */
    public get is_connected(): boolean {
        return this._status.getValue();
    }

    /**
     * Listen to websocket status changes
     */
    public status(next: (_: boolean) => void) {
        return this._status_obs.subscribe(next);
    }

    /**
     * Listen to binding changes on the given status variable
     * @param options Binding details
     * @param next Callback for value changes
     */
    public listen<T = any>(options: EngineRequestOptions, next: (value: T) => void): Subscription {
        const key = `${options.sys}|${options.mod}_${options.index}|${options.name}`;
        /* istanbul ignore else */
        if (!this.binding[key]) {
            this.binding[key] = new BehaviorSubject<T>(null as any);
            this.observers[key] = this.binding[key].asObservable();
        }
        return this.observers[key].subscribe(next);
    }

    /**
     * Get current binding value
     * @param options Binding details
     */
    public value<T = any>(options: EngineRequestOptions): T | undefined {
        const key = `${options.sys}|${options.mod}_${options.index}|${options.name}`;
        if (this.binding[key]) {
            return this.binding[key].getValue() as T;
        }
    }

    /**
     * Bind to status variable on the given system module
     * @param options Binding request options
     */
    public bind(options: EngineRequestOptions): Promise<void> {
        const request: EngineCommandRequest = { id: ++REQUEST_COUNT, cmd: 'bind', ...options };
        return this.send(request);
    }

    /**
     * Unbind from a status variable on the given system module
     * @param options Unbind request options
     */
    public unbind(options: EngineRequestOptions): Promise<void> {
        const request: EngineCommandRequest = { id: ++REQUEST_COUNT, cmd: 'unbind', ...options };
        return this.send(request);
    }

    /**
     * Execute method on the given system module
     * @param options Exec request options
     */
    public exec(options: EngineExecRequestOptions): Promise<any> {
        const request: EngineCommandRequest = { id: ++REQUEST_COUNT, cmd: 'exec', ...options };
        return this.send(request);
    }

    /**
     * Listen to debug logging for on the given system module binding
     * @param options Debug request options
     */
    public debug(options: EngineRequestOptions): Promise<void> {
        const request: EngineCommandRequest = { id: ++REQUEST_COUNT, cmd: 'debug', ...options };
        return this.send(request);
    }

    /**
     * Stop listen to debug logging for on the given system module binding
     * @param options Debug request options
     */
    public ignore(options: EngineRequestOptions): Promise<void> {
        const request: EngineCommandRequest = { id: ++REQUEST_COUNT, cmd: 'ignore', ...options };
        return this.send(request);
    }

    /**
     * Send request to engine through the websocket connection
     * @param request New request to post to the server
     */
    protected send(request: EngineCommandRequest, tries: number = 0): Promise<any> {
        const key = `${request.cmd}|${request.sys}|${request.mod}${request.index}|${request.name}`;
        /* istanbul ignore else */
        if (!this.requests[key]) {
            const req: EngineCommandRequestMetadata = { ...request, key };
            req.promise = new Promise((resolve, reject) => {
                if (this.websocket && this.is_connected) {
                    req.resolve = d => resolve(d);
                    req.reject = e => reject(e);
                    const bind = `${request.sys}, ${request.mod}_${request.index}, ${request.name}`;
                    engine_socket.log(
                        'WS',
                        `[${request.cmd.toUpperCase()}](${request.id}) ${bind}`,
                        request.args
                    );
                    this.websocket.next(request);
                } else {
                    setTimeout(() => {
                        delete this.requests[key];
                        this.send(request, tries).then(_ => resolve(_), _ => reject(_));
                    }, 300 * Math.min(20, ++tries));
                }
            });
            this.requests[key] = req;
        }
        return this.requests[key].promise as Promise<any>;
    }

    /**
     * Callback for messages from the server
     * @param message Message from the engine server
     */
    protected onMessage(message: EngineResponse | 'pong'): void {
        if (message !== 'pong' && message instanceof Object) {
            if (message.type === 'notify' && message.meta) {
                this.handleNotify(message.meta, message.value);
            } else if (message.type === 'success') {
                this.handleSuccess(message);
            } else if (message.type === 'debug') {
                engine_socket.log('WS', `[DEBUG] ${message.mod}${message.klass} →`, message.msg);
                this.debug_events.next({
                    module: message.mod || '<empty>',
                    class_name: message.klass || '<empty>',
                    message: message.msg || '<empty>',
                    level: message.level || EngineLogLevel.Debug
                });
            } else if (message.type === 'error') {
                this.handleError(message);
            } else if (!(message as any).cmd) {
                // Not mock message
                engine_socket.log('WS', 'Invalid websocket message', message, 'error');
            }
        }
    }

    /**
     * Handle websocket success response
     * @param message Success message
     */
    protected handleSuccess(message: EngineResponse) {
        const request = Object.keys(this.requests)
            .map(i => this.requests[i])
            .find(i => i.id === message.id);
        engine_socket.log('WS', `[SUCCESS](${message.id})`);
        /* istanbul ignore else */
        if (request && request.resolve) {
            request.resolve(message.value);
            delete this.requests[request.key];
        }
    }

    /**
     * Handle websocket request error
     * @param message Error response
     */
    protected handleError(message: EngineResponse) {
        let type = 'UNEXPECTED FAILURE';
        switch (message.code) {
            case EngineErrorCodes.ACCESS_DENIED:
                type = 'ACCESS DENIED';
                break;
            case EngineErrorCodes.BAD_REQUEST:
                type = 'BAD REQUEST';
                break;
            case EngineErrorCodes.MOD_NOT_FOUND:
                type = 'MODULE NOT FOUND';
                break;
            case EngineErrorCodes.SYS_NOT_FOUND:
                type = 'SYSTEM NOT FOUND';
                break;
            case EngineErrorCodes.PARSE_ERROR:
                type = 'PARSE ERROR';
                break;
            case EngineErrorCodes.REQUEST_FAILED:
                type = 'REQUEST FAILED';
                break;
            case EngineErrorCodes.UNKNOWN_CMD:
                type = 'UNKNOWN COMMAND';
                break;
        }
        engine_socket.log(
            'WS',
            `[ERROR] ${type}(${message.id}): ${message.msg}`,
            undefined,
            'error'
        );
        const request = Object.keys(this.requests)
            .map(i => this.requests[i])
            .find(i => i.id === message.id);
        if (request && request.reject) {
            request.reject(message);
            delete this.requests[request.key];
        }
    }

    /**
     * Update the current value of the binding
     * @param options Binding details
     * @param value New binding value
     */
    protected handleNotify<T = any>(options: EngineRequestOptions, value: T): void {
        const key = `${options.sys}|${options.mod}_${options.index}|${options.name}`;
        if (!this.binding[key]) {
            this.binding[key] = new BehaviorSubject<T>(null as any);
            this.observers[key] = this.binding[key].asObservable();
        }
        const bind = `${options.sys}, ${options.mod}_${options.index}, ${options.name}`;
        engine_socket.log('WS', `[NOTIFY] ${bind} changed`, [
            this.binding[key].getValue(),
            '→',
            value
        ]);
        this.binding[key].next(value);
    }

    /**
     * Connect to engine websocket
     */
    protected connect(tries: number = 0) {
        if (!this.options) {
            throw new Error('No token is set for engine websocket');
        }
        this._connection_attempts++;
        this.createWebsocket();
        if (this.websocket && this.auth.token && this.auth.is_online) {
            this.websocket.subscribe(
                (resp: EngineResponse) => {
                    if (!this._status.getValue()) {
                        this._status.next(true);
                    }
                    this._connection_attempts = 0;
                    this.clearHealthCheck();
                    this.onMessage(resp);
                },
                (err: SimpleNetworkError) => {
                    this.clearHealthCheck();
                    this.onWebSocketError(err);
                },
                () => this._status.next(false)
            );
            if (this.keep_alive) {
                clearInterval(this.keep_alive);
            }
            this.ping();
            this.keep_alive = setInterval(() => this.ping(), KEEP_ALIVE * 1000) as any;
            this.clearHealthCheck();
            this._health_check = setTimeout(() => {
                engine.log('WS', 'Unhealthy connection. Reconnecting...');
                this._status.next(false);
                this.reconnect();
            }, 30 * 1000) as any;
        } else {
            /* istanbul ignore else */
            if (!this.websocket) {
                engine_socket.log(
                    'WS',
                    `Failed to create websocket(${tries}). Retrying...`,
                    undefined,
                    'error'
                );
            }
            setTimeout(() => this.connect(tries), 300 * Math.min(20, ++tries));
        }
    }

    /**
     * Create websocket connection
     */
    protected createWebsocket() {
        const secure = this.options.secure || location.protocol.indexOf('https') >= 0;
        const host = this.options.host || location.host;
        const url = `ws${secure ? 's' : ''}://${host}${this.route}?bearer_token=${this.auth.token}${
            this.options.fixed ? '&fixed_device=true' : ''
        }`;
        engine.log('WS', `Connecting to ws${secure ? 's' : ''}://${host}${this.route}`);
        this.websocket = engine_socket.websocket({
            url,
            serializer: data => (typeof data === 'object' ? JSON.stringify(data) : data),
            deserializer: data => {
                let return_value = data.data;
                try {
                    const obj = JSON.parse(data.data);
                    return_value = obj;
                } catch (e) {
                    return_value = return_value;
                }
                return return_value;
            }
        });
    }

    /**
     * Close old websocket connect and open a new one
     */
    protected reconnect() {
        /* istanbul ignore else */
        if (this.websocket && this.is_connected) {
            this.websocket.complete();
            /* istanbul ignore else */
            if (this.keep_alive) {
                clearInterval(this.keep_alive);
                this.keep_alive = undefined;
            }
        }
        setTimeout(() => this.connect(), Math.min(5000, this._connection_attempts * 300 || 1000));
    }

    /**
     * Send ping through the websocket
     */
    protected ping() {
        if (this.websocket) {
            this.websocket.next('ping');
        }
    }

    /**
     * Handle errors on the websocket
     * @param err Network error response
     */
    protected onWebSocketError(err: SimpleNetworkError) {
        this._status.next(false);
        engine_socket.log('WS', 'Websocket error:', err, undefined, 'error');
        /* istanbul ignore else */
        if (err.status === 401) {
            this.auth.invalidateToken();
        }
        this.auth.refreshAuthority();
        // Try reconnecting after 1 second
        this.reconnect();
    }

    /**
     * Clear health check timer
     */
    protected clearHealthCheck() {
        if (this._health_check) {
            clearTimeout(this._health_check);
            delete this._health_check;
        }
    }
}
