import { Composer } from '../../../composer';
import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineSettings } from '../settings/settings.class';
import { EngineZonesService } from './zones.service';

export class EngineZone extends EngineResource<EngineZonesService> {
    /** Description of the driver functionality */
    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this.change('description', value);
    }

    /** List of the trigger IDs associated with the zone */
    public get triggers(): string[] {
        return [...this._triggers];
    }
    /** Map of user settings for the system */
    public settings: EngineSettings;
    /** Description of the zone's purpose */
    private _description: string;
    /** List of triggers associated with the zone */
    private _triggers: string[];

    constructor(protected _service: EngineZonesService, raw_data: HashMap) {
        super(_service, raw_data);
        this._description = raw_data.description;
        this._triggers = raw_data.triggers;
        this.settings = new EngineSettings({} as any, raw_data.settings || { parent_id: this.id });
        this._init_sub = Composer.initialised.subscribe(intitialised => {
            if (intitialised) {
                this.settings = new EngineSettings(Composer.settings, raw_data.settings || { parent_id: this.id });
                if (this._init_sub) {
                    this._init_sub.unsubscribe();
                }
            }
        });
    }
}
