import { of } from 'rxjs';

import { EngineApplication } from '../../../../src/http/services/applications/application.class';
import { EngineApplicationsService } from '../../../../src/http/services/applications/applications.service';

describe('EngineApplicationsService', () => {
    let service: EngineApplicationsService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineApplicationsService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineApplicationsService);
    });

    it('allow querying systems index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/applications');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineApplication);
    });

    it('allow querying systems show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/applications/test');
        expect(result).toBeInstanceOf(EngineApplication);
    });
});
