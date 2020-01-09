import { of } from 'rxjs';

import { EngineSettings } from '../../../../src/http/services/settings/settings.class';
import { EngineSettingsService } from '../../../../src/http/services/settings/settings.service';

describe('EngineSettingsService', () => {
    let service: EngineSettingsService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineSettingsService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineSettingsService);
    });

    it('allow querying settings index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/settings');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineSettings);
    });

    it('allow querying settings show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/settings/test');
        expect(result).toBeInstanceOf(EngineSettings);
    });
});
