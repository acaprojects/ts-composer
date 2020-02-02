import { EngineLDAPSource } from '../../../../src/http/services/ldap-sources/ldap-source.class';

describe('EngineLdapSource', () => {
    let auth_source: EngineLDAPSource;
    let service: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        auth_source = new EngineLDAPSource(service, {
            id: 'dep-test',
            authority_id: 'test-authority',
            host: 'test',
            created_at: 999
        });
    });

    it('should create instance', () => {
        expect(auth_source).toBeTruthy();
        expect(auth_source).toBeInstanceOf(EngineLDAPSource);
    });

    it('should not allow editing the authority ID', () => {
        expect(auth_source.authority_id).toBe('test-authority');
        expect(() => auth_source.storePendingChange('authority_id', 'not-test-authority')).toThrowError();
    });

    it('should allow editing fields', () => {
        expect(auth_source.host).toBe('test');
        auth_source.storePendingChange('host', 'not-test');
        expect(auth_source.host).not.toBe('not-test');
        expect(auth_source.changes.host).toBe('not-test');
    });
});
