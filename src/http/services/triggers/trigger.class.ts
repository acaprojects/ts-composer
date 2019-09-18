import { EngineResource } from '../resources/resource.class';
import { HashMap } from '../../../utilities/types.utilities';
import { EngineTriggersService } from './triggers.service';

export class EngineTrigger extends EngineResource<EngineTriggersService> {
    constructor(protected service: EngineTriggersService, raw_data: HashMap) {
        super(service, raw_data);
    }
}
