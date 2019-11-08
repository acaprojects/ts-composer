import { of } from 'rxjs';

import { EngineSystemTriggersService } from '../../../../src/http/services/triggers/system-triggers.service';
import { EngineTrigger } from '../../../../src/http/services/triggers/trigger.class';

describe('EngineSystemTriggersService', () => {
    let service: EngineSystemTriggersService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineSystemTriggersService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineSystemTriggersService);
    });

    it('allow querying triggers index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/system-triggers');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineTrigger);
    });

    it('allow querying triggers show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/system-triggers/test');
        expect(result).toBeInstanceOf(EngineTrigger);
    });
});
