import { Subscription } from 'rxjs';
import { EngineBindingService } from '../binding.service';
import { EngineRequestOptions } from '../websocket.interfaces';
import { EngineModuleBinding } from './engine-module.class';

export class EngineVariableBinding {
    /** Status variable name */
    public readonly name: string;
    /** Number of active bindings to this variable */
    private _binding_count: number = 0;
    /** Number of bindings to restore on reconnection */
    private _stale_bindings: number = 0;

    constructor(
        private _service: EngineBindingService,
        private _module: EngineModuleBinding,
        _name: string
    ) {
        this.name = _name;
        // Listen for state changes in the websocket connection
        this._service.engine.status(value => {
            if (value && this._stale_bindings) {

                this.rebind();
            } else {
                this._stale_bindings = this._binding_count || this._stale_bindings;
                this._binding_count = 0;
            }
        });
    }

    /** Number of bindings to this status variable */
    public get count(): number {
        return this._binding_count;
    }

    /** Current value of the binding */
    public get value(): any {
        return this._service.engine.value(this.binding());
    }

    /**
     * Subscribe to changes of the variable's binding value
     * @param next Callback for changes to the bindings value
     */
    public listen(next: (_: any) => void): Subscription {
        return this._service.engine.listen(this.binding(), next);
    }

    /**
     * Bind to the status variable's value
     */
    public bind(): () => void {
        /* istanbul ignore else */
        if (this._binding_count <= 0) {
            this._service.engine.bind(this.binding()).then(() => {
                this._binding_count++;
            }, _ => null);
        }
        return () => this.unbind();
    }

    /**
     * Unbind from status variable
     */
    public unbind() {
        if (this._binding_count === 1) {
            this._service.engine.unbind(this.binding()).then(() => {
                this._binding_count--;
            }, _ => null);
        } else {
            this._binding_count--;
            if (this._binding_count < 0) {
                this._binding_count = 0;
            }
        }
    }

    /**
     * Rebind to the status variable
     */
    private rebind() {
        this._service.engine.bind(this.binding()).then(() => {
            this._binding_count = this._stale_bindings;
            this._stale_bindings = 0;
        });
    }

    /**
     * Generate binding details for the status variable
     */
    private binding(): EngineRequestOptions {
        return {
            sys: this._module.system.id,
            mod: this._module.name,
            index: this._module.index,
            name: this.name
        };
    }
}
