import { HashMap } from '../../../utilities/types.utilities';
import { EngineHttpClient } from '../../http.service';
import { EngineResourceService } from '../resources/resources.service';
import { EngineUser } from './user.class';
import { EngineUserQueryOptions } from './user.interfaces';

export class EngineUsersService extends EngineResourceService<EngineUser> {
    /* istanbul ignore next */
    constructor(protected http: EngineHttpClient) {
        super(http);
        this._name = 'User';
        this._api_route = 'users';
    }

    /**
     * Query the index of the API route associated with this service
     * @param query_params Map of query paramaters to add to the request URL
     */
    public query(query_params?: EngineUserQueryOptions) {
        return super.query(query_params);
    }

    /**
     * Query the API for the currently logged in user
     */
    public current() {
        return super.show('current');
    }

    /**
     * Convert API data into local interface
     * @param item Raw API data
     */
    protected process(item: HashMap) {
        return new EngineUser(this, item);
    }
}
