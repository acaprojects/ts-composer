import { HashMap } from '../../../utilities/types.utilities'
import { EngineHttpClient } from '../../http.service'
import { EngineResourceService } from '../resources/resources.service'
import { EngineApplication } from './application.class'
import { IEngineApplicationQuery } from './application.interfaces'

export class EngineApplicationsService extends EngineResourceService<EngineApplication> {
    constructor(protected http: EngineHttpClient) {
        super(http)
        this._name = 'Application'
        this._api_route = 'applications'
    }

    /**
     * Query the index of the API route associated with this service
     * @param query_params Map of query paramaters to add to the request URL
     */
    public query(query_params?: IEngineApplicationQuery) {
        return super.query(query_params)
    }

    /**
     * Convert API data into local interface
     * @param item Raw API data
     */
    protected process(item: HashMap) {
        return new EngineApplication(this, item)
    }
}