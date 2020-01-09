import { HashMap } from '../../../utilities/types.utilities';
import { EngineHttpClient } from '../../http.service';
import { EngineResourceService } from '../resources/resources.service';
import { EngineSettings } from './settings.class';
import { EngineSettingsQueryOptions } from './settings.interfaces';

export class EngineSettingsService extends EngineResourceService<EngineSettings> {
    /* istanbul ignore next */
    constructor(protected http: EngineHttpClient) {
        super(http);
        this._name = 'Settings';
        this._api_route = 'settings';
    }

    /**
     * Query the index of the API route associated with this service
     * @param query_params Map of query paramaters to add to the request URL
     */
    public query(query_params?: EngineSettingsQueryOptions) {
        return super.query(query_params);
    }

    /**
     * Convert API data into local interface
     * @param item Raw API data
     */
    protected process(item: HashMap) {
        return new EngineSettings(this, item);
    }
}
