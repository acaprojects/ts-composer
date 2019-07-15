import { EngineResourceService } from '../resources/resources.service'
import { EngineHttpClient } from '../../http.service'
import { EngineDriver } from './driver.class'
import { IEngineDependencyQuery } from './drivers.interfaces'
import { HashMap } from '../../../utilities/types.utilities'

export class EngineDriversService extends EngineResourceService<EngineDriver> {
    constructor(protected http: EngineHttpClient) {
        super(http)
        this._name = 'Driver'
        this._api_route = 'dependencies'
    }

    /**
     * Query the index of the API route associated with this service
     * @param query_params Map of query paramaters to add to the request URL
     */
    public query(query_params?: IEngineDependencyQuery) {
        return super.query(query_params)
    }

    /**
     * Live loads or reloads the latest version of the given driver
     * @param id Dependency ID
     */
    public reload(id: string): Promise<void> {
        return this.task(id, 'reload')
    }

    /**
     * Convert API data into local interface
     * @param item Raw API data
     */
    protected process(item: HashMap) {
        return new EngineDriver(this, item)
    }
}