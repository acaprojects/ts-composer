import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineDomainsService } from './domains.service';

export class EngineDomain extends EngineResource<EngineDomainsService> {
    /** Domain name */
    public get domain(): string {
        return this._dom;
    }

    public set domain(value: string) {
        this.change('dom', value);
    }
    /** Login URL for the domain */
    public get login_url(): string {
        return this._login_url;
    }

    public set login_url(value: string) {
        this.change('login_url', value);
    }
    /** Logout URL for the domain */
    public get logout_url(): string {
        return this._logout_url;
    }

    public set logout_url(value: string) {
        this.change('logout_url', value);
    }
    /** Description of the driver functionality */
    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this.change('description', value);
    }

    /** Local configuration for the domain */
    public get config(): HashMap {
        return JSON.parse(JSON.stringify(this._config));
    }

    public set config(value: HashMap) {
        this.change('config', value);
    }

    /** Internal settings for the domain */
    public get internals(): HashMap {
        return JSON.parse(JSON.stringify(this._internals));
    }

    public set internals(value: HashMap) {
        this.change('internals', value);
    }

    /** Domain name */
    private _dom: string;
    /** Login URL for the domain */
    private _login_url: string;
    /** Logout URL for the domain */
    private _logout_url: string;
    /** Description of the application domain */
    private _description: string;
    /** Local configuration for the domain */
    private _config: HashMap;
    /** Internal settings for the domain */
    private _internals: HashMap;

    constructor(protected _service: EngineDomainsService, raw_data: HashMap) {
        super(_service, raw_data);
        this._description = raw_data.description;
        this._dom = raw_data.domain || raw_data.dom;
        this._login_url = raw_data.login_url;
        this._logout_url = raw_data.logout_url;
        this._config = raw_data.config;
        this._internals = raw_data.internals;
    }
}
