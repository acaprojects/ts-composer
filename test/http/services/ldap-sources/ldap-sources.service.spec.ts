import { of } from 'rxjs';

import { EngineLDAPSource } from '../../../../src/http/services/ldap-sources/ldap-source.class';
import { EngineLDAPSourcesService } from '../../../../src/http/services/ldap-sources/ldap-sources.service';

describe('EngineDomainsService', () => {
    let service: EngineLDAPSourcesService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineLDAPSourcesService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineLDAPSourcesService);
    });

    it('allow querying systems index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/ldap_auths');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineLDAPSource);
    });

    it('allow querying systems show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/ldap_auths/test');
        expect(result).toBeInstanceOf(EngineLDAPSource);
    });
});
