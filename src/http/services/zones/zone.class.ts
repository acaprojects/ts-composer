import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineZonesService } from './zones.service';

export class EngineZone extends EngineResource<EngineZonesService> {
    /** Description of the driver functionality */
    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this.change('description', value);
    }

    /** Local settings for the zone */
    public get settings(): HashMap {
        return JSON.parse(JSON.stringify(this._settings));
    }

    public set settings(value: HashMap) {
        this.change('settings', value);
    }

    /** List of the trigger IDs associated with the zone */
    public get triggers(): string[] {
        return [...this._triggers];
    }
    /** Timestamp the zone was created at, in ms since UTC epoch */
    public readonly created_at: number;
    /** Description of the zone's purpose */
    private _description: string;
    /** Local settings for the zone */
    private _settings: HashMap;
    /** List of triggers associated with the zone */
    private _triggers: string[];

    constructor(protected service: EngineZonesService, raw_data: HashMap) {
        super(service, raw_data);
        this.created_at = raw_data.created_at;
        this._description = raw_data.description;
        this._settings = raw_data.settings;
        this._triggers = raw_data.triggers;
    }
}
