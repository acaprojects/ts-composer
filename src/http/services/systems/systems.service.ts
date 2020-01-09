import { EngineResourceService } from '../resources/resources.service';

import { HashMap } from '../../../utilities/types.utilities';
import { EngineHttpClient } from '../../http.service';
import { EngineSystem } from './system.class';
import {
    EngineModuleFunctionMap,
    EngineSystemShowOptions,
    EngineSystemsQueryOptions
} from './system.interfaces';

export class EngineSystemsService extends EngineResourceService<EngineSystem> {
    /* istanbul ignore next */
    constructor(protected http: EngineHttpClient) {
        super(http);
        this._name = 'System';
        this._api_route = 'systems';
    }

    /**
     * Query the index of the API route associated with this service
     * @param query_params Map of query paramaters to add to the request URL
     */
    public query(query_params?: EngineSystemsQueryOptions) {
        return super.query(query_params);
    }

    /**
     * Query the API route for a sepecific item
     * @param id ID of the item
     * @param query_params Map of query paramaters to add to the request URL
     */
    public show(id: string, query_params?: EngineSystemShowOptions) {
        return super.show(id, query_params);
    }

    /**
     * Remove module from the given system
     * @param id System ID
     * @param module_id ID of the module to remove
     */
    public remove(id: string, module_id: string): Promise<void> {
        return this.task(id, 'remove', { module_id });
    }

    /**
     * Start the given system and clears any existing caches
     * @param id System ID
     */
    public start(id: string): Promise<void> {
        return this.task(id, 'start');
    }

    /**
     * Stops all modules in the given system
     * @param id System ID
     */
    public stop(id: string): Promise<void> {
        return this.task(id, 'stop');
    }

    /**
     * Execute a function of the given system module
     * @param id System ID
     * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
     * @param index Module index. Defaults to `1`
     * @param args Array of arguments to pass to the executed method
     */
    public execute(
        id: string,
        module: string,
        index: number = 1,
        args: any[] = []
    ): Promise<HashMap> {
        return this.task(id, 'exec', { module, index, args });
    }

    /**
     * Get the state of the given system module
     * @param id System ID
     * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
     * @param index Module index. Defaults to `1`
     * @param lookup Status variable of interest. If set it will return only the state of this variable
     */
    public state(id: string, module: string, index: number = 1, lookup?: string): Promise<HashMap> {
        return this.task(id, 'state', { module, index, lookup }, 'get');
    }

    /**
     * Get the list of functions for the given system module
     * @param id System ID
     * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
     * @param index Module index. Defaults to `1`
     */
    public functionList(
        id: string,
        module: string,
        index: number = 1
    ): Promise<EngineModuleFunctionMap> {
        return this.task(id, 'funcs', { module, index }, 'get');
    }

    /**
     * Occurances of a particular type of module in the given system
     * @param id System ID
     * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
     */
    public count(id: string, module: string): Promise<{ count: number }> {
        return this.task(id, 'count', { module }, 'get');
    }

    /**
     * List types of modules and counts in the given system
     * @param id System ID
     */
    public types(id: string): Promise<HashMap<number>> {
        return this.task(id, 'count', undefined, 'get');
    }

    /**
     * Convert API data into local interface
     * @param item Raw API data
     */
    protected process(item: HashMap) {
        return new EngineSystem(this, item);
    }
}
