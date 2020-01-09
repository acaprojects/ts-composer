import { Composer } from '../../../composer';
import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineSettings } from '../settings/settings.class';
import { EngineDriverRole } from './drivers.enums';
import { EngineDriversService } from './drivers.service';

export class EngineDriver extends EngineResource<EngineDriversService> {
    /** Description of the driver functionality */
    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this.change('description', value);
    }

    /** Name to use for modules that inherit this driver */
    public get module_name(): string {
        return this._module_name;
    }

    public set module_name(value: string) {
        this.change('module_name', value);
    }

    /** Role of the driver in engine */
    public get role(): EngineDriverRole {
        return this._role;
    }

    public set role(value: EngineDriverRole) {
        if (this.id) {
            throw new Error('Role cannot be changed from it\'s initial value');
        }
        this.change('role', value);
    }

    /**  */
    public get default(): string {
        return this._default;
    }

    public set default(value: string) {
        this.change('default', value);
    }

    /** Ignore connection issues */
    public get ignore_connected(): boolean {
        return this._ignore_connected;
    }

    public set ignore_connected(value: boolean) {
        this.change('ignore_connected', value);
    }
    /** Engine class name of the driver */
    public readonly class_name: string;
    /** Map of user settings for the system */
    public settings: EngineSettings;
    /** Description of the driver functionality */
    private _description: string;
    /** Name to use for modules that inherit this driver */
    private _module_name: string;
    /** Role of the driver in engine */
    private _role: EngineDriverRole;
    /**  */
    private _default: string;
    /** Ignore connection issues */
    private _ignore_connected: boolean;

    constructor(protected _service: EngineDriversService, raw_data: HashMap) {
        super(_service, raw_data);
        this._description = raw_data.description;
        this._module_name = raw_data.module_name;
        this._role = raw_data.role;
        this._default = raw_data.default;
        this._ignore_connected = raw_data.ignore_connected;
        this.settings = new EngineSettings({} as any, raw_data.settings || { parent_id: this.id });
        this._init_sub = Composer.initialised.subscribe(intitialised => {
            if (intitialised) {
                this.settings = new EngineSettings(Composer.settings, raw_data.settings || { parent_id: this.id });
                if (this._init_sub) {
                    this._init_sub.unsubscribe();
                }
            }
        });
        this.class_name = raw_data.class_name;
    }

    /**
     * Live load/reload the driver
     */
    public reload(): Promise<void> {
        if (!this.id) {
            throw new Error('You must save the module before it can be started');
        }
        return this._service.reload(this.id);
    }
}
