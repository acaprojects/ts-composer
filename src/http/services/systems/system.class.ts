
import { first } from 'rxjs/operators';

import { ACAEngine } from '../../../acaengine';
import { HashMap } from '../../../utilities/types.utilities';
import { EngineModule } from '../modules/module.class';
import { EngineResource } from '../resources/resource.class';
import { EngineSettings } from '../settings/settings.class';
import { EngineSystemsService } from './systems.service';

export const SYSTEM_MUTABLE_FIELDS = [
    'name',
    'email',
    'description',
    'email',
    'capacity',
    'features',
    'bookable',
    'installed_ui_devices',
    'support_url',
    'modules',
    'zones'
] as const;
type SystemMutableTuple = typeof SYSTEM_MUTABLE_FIELDS;
export type SystemMutableFields = SystemMutableTuple[number];

export class EngineSystem extends EngineResource<EngineSystemsService> {
    /** Map of user settings for the system */
    public settings: EngineSettings;
    /** Description of the system */
    public readonly description: string;
    /** Email address associated with the system */
    public readonly email: string;
    /** Capacity of the space associated with the system */
    public readonly capacity: number;
    /** Features associated with the system */
    public readonly features: string;
    /** Whether system is bookable by end users */
    public readonly bookable: boolean;
    /** Count of UI devices attached to the system */
    public readonly installed_ui_devices: number;
    /** Support URL for the system */
    public readonly support_url: string;
    /** List of module IDs that belong to the system */
    public readonly modules: readonly string[];
    /** List of the zone IDs that the system belongs */
    public readonly zones: readonly string[];
    /** List of modules associated with the system. Only available from the show method with the `complete` query parameter */
    public module_list: readonly EngineModule[] = [];

    constructor(protected _service: EngineSystemsService, raw_data: HashMap) {
        super(_service, raw_data);
        this.description = raw_data.description || '';
        this.email = raw_data.email || '';
        this.capacity = raw_data.capacity || '';
        this.features = raw_data.features || '';
        this.bookable = raw_data.bookable || '';
        this.installed_ui_devices = raw_data.installed_ui_devices || 0;
        this.support_url = raw_data.support_url || '';
        this.modules = raw_data.modules || [];
        this.zones = raw_data.zones || [];
        this.settings = new EngineSettings({} as any, raw_data.settings || { parent_id: this.id });
        ACAEngine.initialised.pipe(first(has_inited => has_inited)).subscribe(() => {
            this.settings = new EngineSettings(
                ACAEngine.settings,
                raw_data.settings || { parent_id: this.id }
            );
            if (raw_data.module_data && raw_data.module_data instanceof Array) {
                this.module_list = raw_data.module_data.map(mod => new EngineModule(ACAEngine.modules, mod));
            }
        });
    }

    public storePendingChange(
        key: SystemMutableFields,
        value: EngineSystem[SystemMutableFields]
    ): this {
        return super.storePendingChange(key as any, value);
    }

    /**
     * Start the given system and clears any existing caches
     */
    public start(): Promise<void> {
        if (!this.id) {
            throw new Error('You must save the system before it can be started');
        }
        return this._service.start(this.id);
    }

    /**
     * Stops all modules in the given system
     */
    public stop(): Promise<void> {
        if (!this.id) {
            throw new Error('You must save the system before it can be stopped');
        }
        return this._service.stop(this.id);
    }

    /**
     * Get list types of modules and counts for the system
     */
    public types(): Promise<HashMap<number>> {
        if (!this.id) {
            throw new Error('You must save the system before you can grab module details');
        }
        return this._service.types(this.id);
    }

    /**
     * Add module with the given ID to the system
     * @param mod_id ID of the module to add
     */
    public addModule(mod_id: string): Promise<EngineSystem> {
        const has_module = this.modules.find(i => i === mod_id);
        if (has_module) {
            return Promise.resolve(this);
        } else {
            this.change('modules', [...this.modules, mod_id]);
            return this.save() as any;
        }
    }

    /**
     * Remove module with the given ID from the system
     * @param mod_id ID of the module to remove
     */
    public removeModule(mod_id: string) {
        return this._service.remove(this.id, mod_id);
    }

    /**
     * Add module with the given ID to the system
     * @param id ID of the zone to add
     */
    public addZone(zone_id: string): Promise<EngineSystem> {
        const has_zone = this.zones.find(i => i === zone_id);
        if (has_zone) {
            return Promise.resolve(this);
        } else {
            this.change('zones', [...this.zones, zone_id]);
            return this.save() as any;
        }
    }

    /**
     * Remove module with the given ID to the system
     * @param id ID of the zone to add
     */
    public removeZone(zone_id: string): Promise<EngineSystem> {
        const new_zone_list = this.zones.filter(i => i !== zone_id);
        if (new_zone_list.length !== this.zones.length) {
            this.change('zones', new_zone_list);
            return this.save() as any;
        } else {
            return Promise.resolve(this);
        }
    }
}
