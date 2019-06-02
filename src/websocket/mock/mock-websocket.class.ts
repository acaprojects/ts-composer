import { Subject, Subscription } from 'rxjs'

import { EngineWebsocket } from '../webocket.class'
import {
    EngineCommandRequest,
    EngineErrorCodes,
    EngineResponse,
    EngineWebsocketOptions
} from '../websocket.interfaces'

import { log } from '../../utilities/general.utilities'
import { HashMap } from '../../utilities/types.utilities'
import { MockEngineWebsocketModule } from './mock-engine-module.class'
import { MockEngineWebsocketSystem } from './mock-engine-system.class'

export const engine = { log }

declare global {
    interface Window {
        control: { systems: HashMap<MockEngineWebsocketSystem> }
    }
}

export class MockEngineWebsocket extends EngineWebsocket {
    protected websocket: any
    /** Listeners for mock bindings values */
    protected listeners: { [id: string]: Subscription } = {}

    constructor(protected options: EngineWebsocketOptions) {
        super(options)
        // Convert static objects on the window into
        /* istanbul ignore else */
        if (window.control && window.control.systems) {
            for (const key in window.control.systems) {
                /* istanbul ignore else */
                if (!(window.control.systems[key] instanceof MockEngineWebsocketSystem)) {
                    window.control.systems[key] = new MockEngineWebsocketSystem(
                        window.control.systems[key]
                    )
                }
            }
        }
    }

    public updateToken(_: string) {}

    /**
     * Connect to engine websocket
     */
    protected connect() {
        this.websocket = new Subject<EngineResponse | EngineCommandRequest>()
        this._status.next(true)
        this.websocket!.subscribe((resp: EngineResponse) => this.onMessage(resp))
    }

    /**
     * Send request to engine through the websocket connection
     * @param request New request to post to the server
     */
    protected send(request: EngineCommandRequest): Promise<any> {
        const key = `${request.sys}|${request.mod}_${request.index}|${request.name}`
        const system: MockEngineWebsocketSystem = window.control.systems[request.sys]
        const module: MockEngineWebsocketModule =
            system && system[request.mod] ? system[request.mod][request.index - 1 || 0] : null
        if (module) {
            switch (request.cmd) {
                case 'bind':
                    this.listeners[key] = module.listen(request.name, value => {
                        setTimeout(
                            () =>
                                this.websocket.next({
                                    type: 'notify',
                                    value,
                                    meta: request
                                }),
                            Math.floor(Math.random() * 100 + 50) // Add natual delay before response
                        )
                    })
                    break
                case 'unbind':
                    /* istanbul ignore else */
                    if (this.listeners[key]) {
                        this.listeners[key].unsubscribe()
                        delete this.listeners[key]
                    }
                    break
            }
            setTimeout(() => {
                const resp = {
                    id: request.id,
                    type: 'success',
                    value: request.cmd === 'exec' ? module.call(request.name, request.args) : null
                } as EngineResponse
                this.websocket.next(resp)
            }, 10)
        } else {
            // Error determining system or module
            setTimeout(
                () =>
                    this.websocket.next({
                        id: request.id,
                        type: 'error',
                        code: system
                            ? EngineErrorCodes.SYS_NOT_FOUND
                            : EngineErrorCodes.MOD_NOT_FOUND
                    } as EngineResponse),
                10
            )
        }
        return super.send(request)
    }
}