import { ACAEngine } from '../../../acaengine';
import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineSettings } from '../settings/settings.class';
import { EngineZonesService } from './zones.service';

export const ZONE_MUTABLE_FIELDS = ['name', 'description', 'triggers', 'tags'] as const;
type ZoneMutableTuple = typeof ZONE_MUTABLE_FIELDS;
export type ZoneMutableFields = ZoneMutableTuple[number];

export class EngineZone extends EngineResource<EngineZonesService> {
    /** Map of user settings for the system */
    public settings: EngineSettings;
    /** Description of the zone's purpose */
    public readonly description: string;
    /** List of triggers associated with the zone */
    public readonly triggers: readonly string[];
    /** List of tags associated with the zone */
    public readonly tags: string;

    constructor(protected _service: EngineZonesService, raw_data: HashMap) {
        super(_service, raw_data);
        this.description = raw_data.description || '';
        this.tags = raw_data.tags || '';
        this.triggers = raw_data.triggers || [];
        this.settings = new EngineSettings({} as any, raw_data.settings || { parent_id: this.id });
        this._init_sub = ACAEngine.initialised.subscribe(intitialised => {
            if (intitialised) {
                this.settings = new EngineSettings(ACAEngine.settings, raw_data.settings || { parent_id: this.id });
                if (this._init_sub) {
                    this._init_sub.unsubscribe();
                }
            }
        });
    }

    public storePendingChange(
        key: ZoneMutableFields,
        value: EngineZone[ZoneMutableFields]
    ): this {
        return super.storePendingChange(key as any, value);
    }
}
