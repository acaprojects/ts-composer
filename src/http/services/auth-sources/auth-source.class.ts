import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineAuthSourcesService } from './auth-sources.service';

export class EngineAuthSource extends EngineResource<EngineAuthSourcesService> {

    constructor(protected _service: EngineAuthSourcesService, raw_data: HashMap) {
        super(_service, raw_data);
    }
}
