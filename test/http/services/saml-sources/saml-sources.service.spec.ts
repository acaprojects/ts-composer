import { of } from 'rxjs';

import { EngineSAMLSource } from '../../../../src/http/services/saml-sources/saml-source.class';
import { EngineSAMLSourcesService } from '../../../../src/http/services/saml-sources/saml-sources.service';

describe('EngineDomainsService', () => {
    let service: EngineSAMLSourcesService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineSAMLSourcesService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineSAMLSourcesService);
    });

    it('allow querying systems index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/saml_auths');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineSAMLSource);
    });

    it('allow querying systems show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/saml_auths/test');
        expect(result).toBeInstanceOf(EngineSAMLSource);
    });
});
