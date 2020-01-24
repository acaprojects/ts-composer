import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineDomainsService } from './domains.service';

export const DOMAIN_MUTABLE_FIELDS = ['name', 'dom', 'login_url', 'logout_url', 'description', 'config', 'internals'] as const;
type DomainMutableTuple = typeof DOMAIN_MUTABLE_FIELDS;
export type DomainMutableFields = DomainMutableTuple[number];

export class EngineDomain extends EngineResource<EngineDomainsService> {
    /** Domain name */
    public readonly dom: string;
    /** Login URL for the domain */
    public readonly login_url: string;
    /** Logout URL for the domain */
    public readonly logout_url: string;
    /** Description of the domain domain */
    public readonly description: string;
    /** Local configuration for the domain */
    public readonly config: string;
    /** Internal settings for the domain */
    public readonly internals: string;

    constructor(protected _service: EngineDomainsService, raw_data: HashMap) {
        super(_service, raw_data);
        this.description = raw_data.description || '';
        this.dom = raw_data.domain || raw_data.dom || '';
        this.login_url = raw_data.login_url || '';
        this.logout_url = raw_data.logout_url || '';
        this.config = raw_data.config || '{}';
        this.internals = raw_data.internals || '{}';
    }

    public storePendingChange(
        key: DomainMutableFields,
        value: EngineDomain[DomainMutableFields]
    ): this {
        return super.storePendingChange(key as any, value);
    }
}
