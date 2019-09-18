import { of } from 'rxjs';

import { EngineTriggersService } from '../../../../src/http/services/triggers/triggers.service';
import { EngineTrigger } from '../../../../src/http/services/triggers/trigger.class';

describe('EngineZonesService', () => {
    let service: EngineTriggersService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        };
        service = new EngineTriggersService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineTriggersService);
    });

    it('allow querying triggers index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v1/triggers');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineTrigger);
    });

    it('allow querying triggers show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v1/triggers/test');
        expect(result).toBeInstanceOf(EngineTrigger);
    });
});
