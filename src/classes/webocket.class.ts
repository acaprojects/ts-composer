import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import { BehaviorSubject, Subscription, Observable } from 'rxjs'
import { log } from '../utilities/general.utilities'

export type EngineCommand = 'bind' | 'unbind' | 'debug' | 'ignore' | 'exec'

export interface EngineCommandRequest {
    /** Unique request identifier */
    id: string | number
    /** Type of the command to send to engine */
    cmd: EngineCommand
    /** System ID to perform the command  */
    sys: string
    /** Module on the given system to perform the command */
    mod: string
    /** Index of the module in the system */
    index: number
    /** Name of variable to `bind` or method to `exec` on the given module */
    name: string
    /** Aruguments to pass to the method executed on the module */
    args?: any[]
}

export interface EngineRequestOptions {
    /** System ID to perform the command  */
    sys: string
    /** Module on the given system to perform the command */
    mod: string
    /** Index of the module in the system */
    index: number
    /** Name of variable to `bind` or method to `exec` on the given module */
    name: string
}

export interface EngineExecRequestOptions extends EngineRequestOptions {
    args: any[]
}

let REQUEST_COUNT = 0

export interface EngineWebsocketOptions {
    /** Auth token for the engine websocket endpoint */
    token: string
    /** Domain, protocol and port of the engine server */
    host?: string
    /** Whether this endpoint is a fixed device */
    fixed?: boolean
}

export enum EngineErrorCodes {
    PARSE_ERROR = 0,
    BAD_REQUEST = 1,
    ACCESS_DENIED = 2,
    REQUEST_FAILED = 3,
    UNKNOWN_CMD = 4,
    SYS_NOT_FOUND = 5,
    MOD_NOT_FOUND = 6,
    UNEXPECTED_FAILURE = 7
}

export interface EngineResponse {
    /** ID of the associated request */
    id: string | number
    /** Response type */
    type: 'success' | 'error' | 'notify' | 'debug'
    /** Error code */
    code?: number
    /** New value of binding if `notify` or return value from an `exec */
    value?: any
    /** Request metadata */
    meta?: EngineRequestOptions
    /** Debug module */
    mod?: string
    /** Debug module */
    klass?: string
    /** Log message level */
    level?: string
    /** Debug message */
    msg?: string
}

export class EngineWebsocket {
    /** Websocket for connecting to engine */
    protected websocket: WebSocketSubject<any> | undefined
    /** Request promises */
    protected promises: { [id: string]: Promise<any> } = {}
    /** Subjects for listening to values of bindings */
    protected binding: { [id: string]: BehaviorSubject<any> } = {}
    /** Observers for the binding subjects */
    protected observers: { [id: string]: Observable<any> } = {}
    /** Request responders */
    protected promise_callbacks: {
        [id: string]: { resolve: (_: any) => void; reject: (_: any) => void }
    } = {}
    /** Whether the websocket is connected or not */
    private connected: boolean = false

    constructor(private options: EngineWebsocketOptions) {
        this.connect()
    }

    /**
     * Update the websocket token and reconnect the websocket
     * @param token New access token
     */
    public updateToken(token: string) {
        this.options.token = token
        this.reconnect()
    }

    /**
     * Listen to binding changes on the given status variable
     * @param options Binding details
     * @param next Callback for value changes
     */
    public listen<T = any>(options: EngineRequestOptions, next: (value: T) => void): Subscription {
        const key = `${options.sys}|${options.mod}_${options.index}|${options.name}`
        if (!this.binding[key]) {
            this.binding[key] = new BehaviorSubject<T>(null as any)
            this.observers[key] = this.binding[key].asObservable()
        }
        return this.observers[key].subscribe(next)
    }

    /**
     * Bind to status variable on the given system module
     * @param options Binding request options
     */
    public bind(options: EngineRequestOptions): Promise<void> {
        const request: EngineCommandRequest = { id: ++REQUEST_COUNT, cmd: 'bind', ...options }
        return this.send(request)
    }

    /**
     * Send request to engine through the websocket connection
     * @param request
     */
    protected send(request: EngineCommandRequest, tries: number = 0) {
        const key = `bind|${request.sys}|${request.mod}${request.index}|${request.name}`
        if (!this.promises[key]) {
            this.promises[key] = new Promise((resolve, reject) => {
                this.promise_callbacks[`${request.id}`] = { resolve, reject }
                if (this.websocket) {
                    const bind = `${request.sys}, ${request.mod}_${request.index}, ${request.name}`
                    log('WS', `[${request.cmd.toUpperCase()}] ${bind}`, request.args)
                    this.websocket.next(JSON.stringify(request));
                } else {
                    setTimeout(() => {
                        this.send(request, tries).then(_ => resolve(_), _ => reject(_))
                    }, 300 * Math.min(20, ++tries))
                }
            })
        }
        return this.promises[key]
    }

    /**
     * Callback for messages from the server
     * @param message
     */
    protected onMessage(message: EngineResponse) {
        if (message.type === 'notify' && message.meta) {
            this.update(message.meta, message.value)
        } else if (message.type === 'success') {
            log('WS', `[SUCCESS] ${message.id}`)
            if (this.promise_callbacks[`${message.id}`]) {
                const resp = this.promise_callbacks[`${message.id}`]
                resp.resolve(message.value)
                delete this.promise_callbacks[`${message.id}`]
            }
        } else if (message.type === 'debug') {
            log('WS', `[DEBUG] ${message.mod}${message.klass} → ${message.msg}`)
        } else if (message.type === 'error') {
            this.handleError(message)
        } else {
            log('WS', 'Invalid websocket message', message, 'error')
        }
    }

    /**
     * Handle websocket request error
     * @param message Error response
     */
    protected handleError(message: EngineResponse) {
        let type = 'UNEXPECTED FAILURE'
        switch (message.code) {
            case EngineErrorCodes.ACCESS_DENIED:
                type = 'ACCESS DENIED'
                break
            case EngineErrorCodes.BAD_REQUEST:
                type = 'BAD REQUEST'
                break
            case EngineErrorCodes.MOD_NOT_FOUND:
                type = 'MODULE NOT FOUND'
                break
            case EngineErrorCodes.SYS_NOT_FOUND:
                type = 'SYSTEM NOT FOUND'
                break
            case EngineErrorCodes.PARSE_ERROR:
                type = 'PARSE ERROR'
                break
            case EngineErrorCodes.REQUEST_FAILED:
                type = 'REQUEST FAILED'
                break
            case EngineErrorCodes.UNKNOWN_CMD:
                type = 'UNKNOWN COMMAND'
                break
        }
        log('WS', `[Error] ${type}(${message.id}): ${message.msg}`, null, 'error')
    }

    /**
     * Update the current value of the binding
     * @param options Binding details
     * @param value New binding value
     */
    protected update<T = any>(options: EngineRequestOptions, value: T): void {
        const key = `${options.sys}|${options.mod}_${options.index}|${options.name}`
        if (!this.binding[key]) {
            this.binding[key] = new BehaviorSubject<T>(null as any)
            this.observers[key] = this.binding[key].asObservable()
        }
        const bind = `${options.sys}, ${options.mod}_${options.index}, ${options.name}`
        log('WS', `[Notify] ${bind} |`, [this.binding[key].getValue(), '→', value])
        this.binding[key].next(value)
    }

    /**
     * Connect to engine websocket
     */
    protected connect(tries: number = 0) {
        if (tries > 4) {
            return
        }
        if (!this.options || !this.options.token) {
            throw new Error('No token is set for engine websocket')
        }
        const secure = location.protocol.indexOf('https') >= 0
        const host = this.options.host || location.host
        const url = `ws${secure ? 's' : ''}://${host}/control/websocket?bearer=${
            this.options.token
        }`
        this.websocket = webSocket(url)
        if (this.websocket) {
            this.websocket.subscribe(
                (resp: EngineResponse) => {
                    this.connected = true
                    this.onMessage(resp)
                },
                err => {
                    this.connected = false
                    log('WS', 'Websocket error:', err)
                },
                () => (this.connected = false)
            )
        } else {
            setTimeout(() => this.connect(tries), 300 * ++tries)
        }
    }

    /**
     * Close old websocket connect and open a new one
     */
    protected reconnect() {
        if (this.websocket && this.connected) {
            this.websocket.complete()
        }
        this.connect()
    }
}
