import { HashMap } from '../../../utilities/types.utilities';
import { EngineHttpClient } from '../../http.service';
import { EngineResourceService } from '../resources/resources.service';
import { EngineModule } from './module.class';
import { EngineModulePingOptions, EngineModuleQueryOptions } from './module.interfaces';

export class EngineModulesService extends EngineResourceService<EngineModule> {
    /* istanbul ignore next */
    constructor(protected http: EngineHttpClient) {
        super(http);
        this._name = 'Module';
        this._api_route = 'modules';
    }

    /**
     * Query the index of the API route associated with this service
     * @param query_params Map of query paramaters to add to the request URL
     */
    public query(query_params?: EngineModuleQueryOptions) {
        return super.query(query_params);
    }

    /**
     * Starts the module with the given ID and clears any existing caches
     * @param id Module ID
     */
    public start(id: string): Promise<void> {
        return this.task(id, 'start');
    }

    /**
     * Stops the module with the given ID
     * @param id Module ID
     */
    public stop(id: string): Promise<void> {
        return this.task(id, 'stop');
    }

    /**
     * Pings the IP address of the module with the given ID
     * @param id Module ID
     */
    public ping(id: string): Promise<EngineModulePingOptions> {
        return this.task(id, 'ping');
    }

    /**
     * Get the state of the given module
     * @param id Module ID
     * @param lookup Status variable of interest. If set it will return only the state of this variable
     */
    public state(id: string, lookup?: string): Promise<HashMap> {
        return this.task(id, 'state', { lookup }, 'get');
    }

    /**
     * Get the internal state of the given module
     * @param id Module ID
     * @param lookup Status variable of interest. If set it will return only the state of this variable
     */
    public internalState(id: string): Promise<HashMap> {
        return this.task(id, 'internal_state', undefined, 'get');
    }

    /**
     * Convert API data into local interface
     * @param item Raw API data
     */
    protected process(item: HashMap) {
        return new EngineModule(this, item);
    }
}
