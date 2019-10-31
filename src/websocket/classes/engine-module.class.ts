import { HashMap } from '../../utilities/types.utilities';
import { EngineBindingService } from '../binding.service';
import { EngineVariableBinding } from './engine-status-variable.class';
import { EngineSystemBinding } from './engine-system.class';

export class EngineModuleBinding {
    /** Mapping of module bindings */
    private _bindings: HashMap<EngineVariableBinding> = {};

    constructor(
        private _service: EngineBindingService,
        private _system: EngineSystemBinding,
        private _id: string
    ) {}

    public get id(): string {
        return `${this.name}_${this.index}`;
    }

    /** Parent system of the module */
    public get system(): EngineSystemBinding {
        return this._system;
    }

    /** Module index */
    public get index(): number {
        const parts = this._id.split('_');
        const index = parts.pop();
        return parseInt(index || '', 10) || 1;
    }

    /** Module name */
    public get name(): string {
        const parts = this._id.split('_');
        parts.pop();
        return parts.join('_');
    }

    /**
     * Get binding with the given name
     * @param name Name of the binding
     */
    public binding(name: string) {
        if (!this._bindings[name]) {
            this._bindings[name] = new EngineVariableBinding(this._service, this, name);
        }
        return this._bindings[name];
    }

    /**
     * Execute method on the engine module
     * @param method Name of the method
     * @param args Array of arguments to pass to the method
     */
    public exec(method: string, args?: any[]): Promise<any> {
        return this._service.engine.exec({
            sys: this._system.id,
            mod: this.name,
            index: this.index,
            name: method,
            args
        });
    }
}
