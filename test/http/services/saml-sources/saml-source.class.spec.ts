import { EngineSAMLSource } from '../../../../src/http/services/saml-sources/saml-source.class';

describe('EngineSamlSource', () => {
    let auth_source: EngineSAMLSource;
    let service: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        auth_source = new EngineSAMLSource(service, {
            id: 'dep-test',
            authority_id: 'test-authority',
            idp_cert: 'test',
            created_at: 999
        });
    });

    it('should create instance', () => {
        expect(auth_source).toBeTruthy();
        expect(auth_source).toBeInstanceOf(EngineSAMLSource);
    });

    it('should not allow editing the authority ID', () => {
        expect(auth_source.authority_id).toBe('test-authority');
        expect(() => auth_source.storePendingChange('authority_id', 'not-test-authority')).toThrowError();
    });

    it('should allow editing fields', () => {
        expect(auth_source.idp_cert).toBe('test');
        auth_source.storePendingChange('idp_cert', 'not-test');
        expect(auth_source.idp_cert).not.toBe('not-test');
        expect(auth_source.changes.idp_cert).toBe('not-test');
    });
});
