import { of } from 'rxjs';

import { EngineDomain } from '../../../../src/http/services/domains/domain.class';
import { EngineDomainsService } from '../../../../src/http/services/domains/domains.service';

describe('EngineDomainsService', () => {
    let service: EngineDomainsService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineDomainsService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineDomainsService);
    });

    it('allow querying systems index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/domains');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineDomain);
    });

    it('allow querying systems show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/domains/test');
        expect(result).toBeInstanceOf(EngineDomain);
    });
});
