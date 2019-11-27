import { HashMap } from '../utilities/types.utilities';
import { EngineModuleBinding } from './classes/engine-module.class';
import { EngineSystemBinding } from './classes/engine-system.class';
import { EngineWebsocket } from './websocket.class';
import { EngineExecRequestOptions } from './websocket.interfaces';

export class EngineBindingService {
    /** Mapping of system IDs to binding interfaces */
    private _system_list: HashMap<EngineSystemBinding> = {};

    constructor(protected _websocket: EngineWebsocket) { }

    /** Engine websocket */
    public get engine(): EngineWebsocket {
        return this._websocket;
    }

    /**
     * Get binding interface for an engine system
     * @param system_id ID of the system
     */
    public system(system_id: string): EngineSystemBinding {
        if (!this._system_list[system_id]) {
            this._system_list[system_id] = new EngineSystemBinding(this, system_id);
        }
        return this._system_list[system_id];
    }

    /**
     * Get binding interface for an engine module
     * @param system_id ID of the system
     * @param module_id ID of the module withing the system
     * @param index Index of the module within the system
     */
    public module(system_id: string, module_id: string, index: number = 1): EngineModuleBinding {
        const system = this.system(system_id);
        return system.module(module_id, index);
    }

    /**
     * Execute method on the given system module
     * @param options
     */
    public exec(options: EngineExecRequestOptions): Promise<any> {
        return this._websocket.exec(options);
    }
}
