import { EngineResource } from '../resources/resource.class';
import { EngineLDAPSourcesService } from './ldap-sources.service';

import { HashMap } from '../../../utilities/types.utilities';

export const LDAP_SOURCE_MUTABLE_FIELDS = [
    'name',
    'authority_id',
    'host',
    'port',
    'auth_method',
    'uid',
    'base',
    'bind_dn',
    'password',
    'filter'
] as const;
type LdapSourceMutableTuple = typeof LDAP_SOURCE_MUTABLE_FIELDS;
export type LdapSourceMutableFields = LdapSourceMutableTuple[number];

/** List of property keys that can only be set when creating a new object */
const NON_EDITABLE_FIELDS: string[] = ['authority_id'];

export class EngineLDAPSource extends EngineResource<EngineLDAPSourcesService> {
    /** ID of the authority associted with the auth method */
    public readonly authority_id: string;
    /** HTTP URL of the SSO provider */
    public readonly host: string;
    /** Application ID from the SSO provider providing the Ldap services */
    public readonly port: number;
    /** Application secret from the SSO provider providing the Ldap services */
    public readonly auth_method: 'plain' | 'ssl' | 'tls';
    /** Mapping of engine values to SSO provider values */
    public readonly uid: string;
    /** URL from the SSO provider for authorisation */
    public readonly base: string;
    /** Default DN to user when performing a user lookup */
    public readonly bind_dn: string;
    /** Password to access LDAP service */
    public readonly password: string;
    /**
     * LDAP Filter. Can be used instead of `uid`.
     * e.g. (&(uid=%{username})(memberOf=cn=myapp-users,ou=groups,dc=example,dc=com))
     */
    public readonly filter: string;

    constructor(protected _service: EngineLDAPSourcesService, raw_data: HashMap) {
        super(_service, raw_data);
        this.authority_id = raw_data.authority_id || '';
        this.host = raw_data.host || '';
        this.port = raw_data.port || 636;
        this.auth_method = raw_data.auth_method || 'ssl';
        this.uid = raw_data.uid || '';
        this.base = raw_data.base || '';
        this.bind_dn = raw_data.bind_dn || '';
        this.password = raw_data.password || '';
        this.filter = raw_data.filter || '';
    }

    public storePendingChange(
        key: LdapSourceMutableFields,
        value: EngineLDAPSource[LdapSourceMutableFields]
    ): this {
        if (this.id && NON_EDITABLE_FIELDS.indexOf(key) >= 0) {
            throw new Error(`Property "${key}" is not editable.`);
        }
        return super.storePendingChange(key as any, value);
    }
}
