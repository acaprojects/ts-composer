import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import {
    EngineCommandRequest,
    EngineCommandRequestMetadata,
    EngineErrorCodes,
    EngineExecRequestOptions,
    EngineRequestOptions,
    EngineResponse,
    EngineWebsocketOptions
} from './websocket.interfaces';

import { log } from '../utilities/general.utilities';

/** Time in seconds to ping the server to keep the websocket connection alive */
const KEEP_ALIVE = 20;
/** Global counter for websocket request IDs */
let REQUEST_COUNT = 0;

export let engine_socket = { websocket: webSocket, log };

export class EngineWebsocket {
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

    constructor(protected options: EngineWebsocketOptions) {
        REQUEST_COUNT = 0;
        this.connect();
    }

    /**
     * Update the websocket token and reconnect the websocket
     * @param token New access token
     */
    public updateToken(token: string) {
        this.options.token = token;
        this.reconnect();
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
                    engine_socket.log('WS', `[${request.cmd.toUpperCase()}] ${bind}`, request.args);
                    this.websocket.next(JSON.stringify(request));
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
                engine_socket.log('WS', `[Debug] ${message.mod}${message.klass} →`, message.msg);
            } else if (message.type === 'error') {
                this.handleError(message);
            } else {
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
        engine_socket.log('WS', `[SUCCESS] ${message.id}`);
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
        engine_socket.log('WS', `[Error] ${type}(${message.id}): ${message.msg}`, null, 'error');
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
        engine_socket.log('WS', `[Notify] ${bind} |`, [this.binding[key].getValue(), '→', value]);
        this.binding[key].next(value);
    }

    /**
     * Connect to engine websocket
     */
    protected connect(tries: number = 0) {
        if (tries > 4) {
            return;
        }
        if (!this.options || !this.options.token) {
            throw new Error('No token is set for engine websocket');
        }
        const secure = location.protocol.indexOf('https') >= 0;
        const host = this.options.host || location.host;
        const url = `ws${secure ? 's' : ''}://${host}/control/websocket?bearer=${
            this.options.token
        }${this.options.fixed ? '&fixed_device=true' : ''}`;
        this.websocket = engine_socket.websocket(url);
        if (this.websocket) {
            this._status.next(true);
            this.websocket.subscribe(
                (resp: EngineResponse) => this.onMessage(resp),
                err => {
                    this._status.next(false);
                    engine_socket.log('WS', 'Websocket error:', err);
                    // Try reconnecting after 1 second
                    this.reconnect();
                },
                () => this._status.next(false)
            );
            if (this.keep_alive) {
                clearInterval(this.keep_alive);
            }
            this.keep_alive = setInterval(() => this.ping(), KEEP_ALIVE * 1000) as any;
        } else {
            engine_socket.log('WS', `Failed to create websocket(${tries}). Retrying...`);
            setTimeout(() => this.connect(tries), 300 * ++tries);
        }
    }

    /**
     * Close old websocket connect and open a new one
     */
    protected reconnect() {
        if (this.websocket && this.is_connected) {
            this.websocket.complete();
            /* istanbul ignore else */
            if (this.keep_alive) {
                clearInterval(this.keep_alive);
                this.keep_alive = undefined;
            }
        }
        setTimeout(() => this.connect(), 1000);
    }

    /**
     * Send ping through the websocket
     */
    protected ping() {
        if (this.websocket && this.is_connected) {
            this.websocket.next('ping');
        }
    }
}
