import { EngineHttpClient } from '../../http.service'
import { EngineZone } from './zone.class'
import { EngineResourceService } from '../resources/resources.service'
import { IEngineZoneQuery, IEngineZoneShow } from './zone.interfaces'
import { HashMap } from '../../../utilities/types.utilities'

export class EngineZonesService extends EngineResourceService<EngineZone> {
    constructor(protected http: EngineHttpClient) {
        super(http)
        this._name = 'Zone'
        this._api_route = 'zones'
    }

    /**
     * Query the index of the API route associated with this service
     * @param query_params Map of query paramaters to add to the request URL
     */
    public query(query_params?: IEngineZoneQuery) {
        return super.query(query_params)
    }

    /**
     * Query the API route for a sepecific item
     * @param id ID of the item
     * @param query_params Map of query paramaters to add to the request URL
     */
    public show(id: string, query_params?: IEngineZoneShow) {
        return super.show(id, query_params)
    }

    /**
     * Convert API data into local interface
     * @param item Raw API data
     */
    protected process(item: HashMap) {
        return new EngineZone(this, item)
    }
}
