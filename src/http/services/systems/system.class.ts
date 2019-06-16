import { HashMap } from '../../../utilities/types.utilities'
import { EngineResource } from '../resources/resource.class'
import { EngineSystemsService } from './systems.service'

export class EngineSystem extends EngineResource<EngineSystemsService> {
    /** ID of the engine node this system belongs */
    public get edge_id(): string {
        return this._edge_id
    }

    public set edge_id(value: string) {
        if (this.id) {
            throw new Error("Edge ID cannot be changed from it's initial value")
        }
        this.change('edge_id', value)
    }

    /** Description of the system */
    public get description(): string {
        return this._description
    }

    public set description(value: string) {
        this.change('description', value)
    }

    /** Email address associated with the system */
    public get email(): string {
        return this._email
    }

    public set email(value: string) {
        this.change('email', value)
    }

    /** Capacity of the space associated with the system */
    public get capacity(): number {
        return this._capacity
    }

    public set capacity(value: number) {
        this.change('capacity', value)
    }

    /** Features associated with the system */
    public get features(): string {
        return this._features
    }

    /** Whether system is bookable by end users */
    public get bookable(): boolean {
        return this._bookable
    }

    public set bookable(value: boolean) {
        this.change('bookable', value)
    }

    /** Count of UI devices attached to the system */
    public get installed_ui_devices(): number {
        return this._installed_ui_devices
    }

    public set installed_ui_devices(value: number) {
        this.change('installed_ui_devices', value)
    }

    /** Support URL for the system */
    public get support_url(): string {
        return this._support_url
    }

    public set support_url(value: string) {
        this.change('support_url', value)
    }

    /** List of module IDs that belong to the system */
    public get modules(): string[] {
        return [...this._modules]
    }

    /** List of the zone IDs that the system belongs */
    public get zones(): string[] {
        return [...this._zones]
    }
    /** Map of user settings for the system */
    public get settings(): HashMap {
        return { ...this._settings }
    }

    /** Time at which the system was created in ms since UTC epoch */
    public readonly created_at: number
    /** ID of the engine node this system belongs */
    private _edge_id: string
    /** Description of the system */
    private _description: string
    /** Email address associated with the system */
    private _email: string
    /** Capacity of the space associated with the system */
    private _capacity: number
    /** Features associated with the system */
    private _features: string
    /** Whether system is bookable by end users */
    private _bookable: boolean
    /** Count of UI devices attached to the system */
    private _installed_ui_devices: number
    /** Support URL for the system */
    private _support_url: string
    /** List of module IDs that belong to the system */
    private _modules: string[]
    /** List of the zone IDs that the system belongs */
    private _zones: string[]
    /** Map of user settings for the system */
    private _settings: HashMap

    constructor(protected service: EngineSystemsService, raw_data: HashMap) {
        super(service, raw_data)
        this._edge_id = raw_data.edge_id
        this._description = raw_data.description
        this._email = raw_data.email
        this._capacity = raw_data.capacity
        this._features = raw_data.features
        this._bookable = raw_data.bookable
        this._installed_ui_devices = raw_data.installed_ui_devices
        this._support_url = raw_data.support_url
        this._modules = raw_data.modules
        this._zones = raw_data.zones
        this._settings = raw_data.settings
        this.created_at = raw_data.created_at
    }

    /**
     * Start the given system and clears any existing caches
     */
    public start(): Promise<void> {
        if (!this.id) {
            throw new Error('You must save the system before it can be started')
        }
        return this.service.start(this.id)
    }

    /**
     * Stops all modules in the given system
     */
    public stop(): Promise<void> {
        if (!this.id) {
            throw new Error('You must save the system before it can be stopped')
        }
        return this.service.stop(this.id)
    }

    /**
     * Get list types of modules and counts for the system
     */
    public types(): Promise<HashMap<number>> {
        if (!this.id) {
            throw new Error('You must save the system before you can grab module details')
        }
        return this.service.types(this.id)
    }

    /**
     * Add module with the given ID to the system
     * @param mod_id ID of the module to add
     */
    public addModule(mod_id: string): Promise<EngineSystem> {
        const has_module = this.modules.find(i => i === mod_id)
        if (has_module) {
            return Promise.resolve(this)
        } else {
            this.change('modules', [...this._modules, mod_id])
            return this.save() as any
        }
    }

    /**
     * Remove module with the given ID from the system
     * @param mod_id ID of the module to remove
     */
    public removeModule(mod_id: string) {
        return this.service.remove(this.id, mod_id)
    }

    /**
     * Add module with the given ID to the system
     * @param id ID of the zone to add
     */
    public addZone(zone_id: string): Promise<EngineSystem> {
        const has_zone = this.zones.find(i => i === zone_id)
        if (has_zone) {
            return Promise.resolve(this)
        } else {
            this.change('zones', [...this._zones, zone_id])
            return this.save() as any
        }
    }

    /**
     * Remove module with the given ID to the system
     * @param id ID of the zone to add
     */
    public removeZone(zone_id: string): Promise<EngineSystem> {
        const new_zone_list = this._zones.filter(i => i !== zone_id)
        if (new_zone_list.length !== this._zones.length) {
            this.change('zones', new_zone_list)
            return this.save() as any
        } else {
            return Promise.resolve(this)
        }
    }
}
