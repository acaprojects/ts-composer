import { HashMap } from '../../../utilities/types.utilities';
import { EngineDriverRole } from '../drivers/drivers.enums';
import { EngineResource } from '../resources/resource.class';
import { EngineModulePingOptions } from './module.interfaces';
import { EngineModulesService } from './modules.service';

export class EngineModule extends EngineResource<EngineModulesService> {
    /** ID of the driver associated with the module */
    public get dependency_id(): string {
        return this._dependency_id;
    }

    public set dependency_id(value: string) {
        if (this.id) {
            throw new Error('Dependency ID cannot be changed from it\'s initial value');
        }
        this.change('dependency_id', value);
    }

    /** ID of the system associated with the module */
    public get system_id(): string {
        return this._control_system_id;
    }

    public set system_id(value: string) {
        if (this.id) {
            throw new Error('System ID cannot be changed from it\'s initial value');
        }
        this.change('control_system_id', value);
    }

    /** ID of the edge node associated with the module */
    public get edge_id(): string {
        return this._edge_id;
    }

    public set edge_id(value: string) {
        if (this.id) {
            throw new Error('Edge ID cannot be changed from it\'s initial value');
        }
        this.change('edge_id', value);
    }

    /** IP address of the hardware associated with the module */
    public get ip(): string {
        return this._ip;
    }

    public set ip(value: string) {
        if (this.id) {
            throw new Error('IP Address cannot be changed from it\'s initial value');
        }
        this.change('ip', value);
    }

    /** Whether the hardware connection requires TLS */
    public get tls(): boolean {
        return this._tls;
    }

    public set tls(value: boolean) {
        if (this.id) {
            throw new Error('TLS cannot be changed from it\'s initial value');
        }
        this.change('tls', value);
    }

    /** Whether the hardware connection is over UDP */
    public get udp(): boolean {
        return this._udp;
    }

    public set udp(value: boolean) {
        if (this.id) {
            throw new Error('UDP cannot be changed from it\'s initial value');
        }
        this.change('udp', value);
    }

    /** Port number connections to the hardware are made on */
    public get port(): number {
        return this._port;
    }

    public set port(value: number) {
        if (this.id) {
            throw new Error('Port number cannot be changed from it\'s initial value');
        }
        this.change('port', value);
    }

    /**  */
    public get makebreak(): boolean {
        return this._makebreak;
    }

    public set makebreak(value: boolean) {
        if (this.id) {
            throw new Error('Makebreak cannot be changed from it\'s initial value');
        }
        this.change('makebreak', value);
    }

    /** URI associated with the module */
    public get uri(): string {
        return this._uri;
    }

    public set uri(value: string) {
        if (this.id) {
            throw new Error('URI cannot be changed from it\'s initial value');
        }
        this.change('uri', value);
    }

    /** Custom name of the module */
    public get custom_name(): string {
        return this._custom_name;
    }

    public set custom_name(value: string) {
        this.change('custom_name', value);
    }

    /** Local settings for the module */
    public get settings(): HashMap {
        return JSON.parse(JSON.stringify(this._settings));
    }

    public set settings(value: HashMap) {
        this.change('settings', value);
    }

    /** Type of module */
    public get role(): EngineDriverRole {
        return this._role;
    }

    public set role(value: EngineDriverRole) {
        if (this.id) {
            throw new Error('Role cannot be changed from it\'s initial value');
        }
        this.change('role', value);
    }

    /** Notes associated with the module */
    public get notes(): string {
        return this._notes;
    }

    public set notes(value: string) {
        this.change('notes', value);
    }

    /** Ignore connection issues */
    public get ignore_connected(): boolean {
        return this._ignore_connected;
    }

    public set ignore_connected(value: boolean) {
        if (this.id) {
            throw new Error('Ignore connected cannot be changed from it\'s initial value');
        }
        this.change('ignore_connected', value);
    }
    /** Whether the associated hardware is connected */
    public readonly connected: boolean;
    /** Whether the module driver is running */
    public readonly running: boolean;
    /** Timestamp of last update in ms since UTC epoch */
    public readonly updated_at: number;

    /** ID of the driver associated with the module */
    private _dependency_id: string;
    /** ID of the system associated with the module */
    private _control_system_id: string;
    /** ID of the edge node associated with the module */
    private _edge_id: string;
    /** IP address of the hardware associated with the module */
    private _ip: string;
    /** Whether the hardware connection requires TLS */
    private _tls: boolean;
    /** Whether the hardware connection is over UDP */
    private _udp: boolean;
    /** Port number connections to the hardware are made on */
    private _port: number;
    /**  */
    private _makebreak: boolean;
    /** URI associated with the module */
    private _uri: string;
    /** Custom name of the module */
    private _custom_name: string;
    /** Local settings for the module */
    private _settings: HashMap;
    /** Type of module */
    private _role: EngineDriverRole;
    /** Notes associated with the module */
    private _notes: string;
    /** Ignore connection issues */
    private _ignore_connected: boolean;

    constructor(protected _service: EngineModulesService, raw_data: HashMap) {
        super(_service, raw_data);
        this._dependency_id = raw_data.dependency_id;
        this._control_system_id = raw_data.control_system_id;
        this._edge_id = raw_data.edge_id;
        this._ip = raw_data.ip;
        this._tls = raw_data.tls;
        this._udp = raw_data.udp;
        this._port = raw_data.port;
        this._makebreak = raw_data.makebreak;
        this._uri = raw_data.uri;
        this._custom_name = raw_data.custom_name;
        this._settings = raw_data.settings;
        this._role = raw_data.role;
        this._notes = raw_data.notes;
        this._ignore_connected = raw_data.ignore_connected;
        this.connected = raw_data.connected;
        this.running = raw_data.running;
        this.updated_at = raw_data.updated_at;
    }

    /**
     * Start the module and clears any existing caches
     */
    public start(): Promise<void> {
        if (!this.id) {
            throw new Error('You must save the module before it can be started');
        }
        return this._service.start(this.id);
    }

    /**
     * Stops the module
     */
    public stop(): Promise<void> {
        if (!this.id) {
            throw new Error('You must save the module before it can be stopped');
        }
        return this._service.stop(this.id);
    }

    /**
     * Pings the module
     */
    public ping(): Promise<EngineModulePingOptions> {
        if (!this.id) {
            throw new Error('You must save the module before it can be pinged');
        }
        return this._service.ping(this.id);
    }

    /**
     * Get the state of the module
     * @param lookup Status variable of interest. If set it will return only the state of this variable
     */
    public state(lookup?: string): Promise<HashMap> {
        if (!this.id) {
            throw new Error('You must save the module before it\'s state can be grabbed');
        }
        return this._service.state(this.id, lookup);
    }

    /**
     * Get the internal state of the module
     */
    public internalState(): Promise<HashMap> {
        if (!this.id) {
            throw new Error('You must save the module before it\'s internal state can be grabbed');
        }
        return this._service.internalState(this.id);
    }
}
