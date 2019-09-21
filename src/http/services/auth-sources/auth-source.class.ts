import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineAuthSourcesService } from './auth-sources.service';

export class EngineAuthSource extends EngineResource<EngineAuthSourcesService> {
    /** Timestamp the zone was created at, in ms since UTC epoch */
    public readonly created_at: number;

    constructor(protected service: EngineAuthSourcesService, raw_data: HashMap) {
        super(service, raw_data);
        this.created_at = raw_data.created_at;
    }
}
