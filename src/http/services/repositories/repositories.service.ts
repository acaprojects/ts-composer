import { HashMap } from '../../../utilities/types.utilities';
import { EngineHttpClient } from '../../http.service';
import { EngineDriverDetails } from '../drivers/drivers.interfaces';
import { EngineResourceService } from '../resources/resources.service';
import { EngineRepository } from './repository.class';
import { EngineRepositoryCommitQuery, EngineRepositoryDetailsQuery } from './repository.interfaces';

export class EngineRepositoriesService extends EngineResourceService<EngineRepository> {
    /* istanbul ignore next */
    constructor(protected http: EngineHttpClient) {
        super(http);
        this._name = 'Repository';
        this._api_route = 'repositories';
    }

    /**
     * Get a list of all the drivers for a repository
     * @param id ID of the repository
     * @param query Addition query parameters to pass to the request
     */
    public async listDrivers(id: string, query?: HashMap): Promise<string[]> {
        return await this.task(id, 'drivers', query || {}, 'get');
    }

    /**
     * Get a list of all the commits for a repository
     * @param id ID of the repository
     * @param query Addition query parameters to pass to the request
     */
    public async listCommits(id: string, query: EngineRepositoryCommitQuery): Promise<string[]> {
        return await this.task(id, 'commits', query, 'get');
    }

    /**
     * The
     * @param id ID of the repository
     * @param query Addition query parameters to pass to the request
     */
    public async driverDetails(id: string, query: EngineRepositoryDetailsQuery): Promise<EngineDriverDetails> {
        return await this.task(id, 'details', query, 'get');
    }

    /**
     * Convert API data into local interface
     * @param item Raw API data
     */
    protected process(item: HashMap) {
        return new EngineRepository(this, item);
    }
}
