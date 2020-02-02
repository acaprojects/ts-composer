// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { EngineAuthOptions } from './auth/auth.interfaces';
import { EngineAuthService } from './auth/auth.service';
import { EngineHttpClient } from './http/http.service';
import { MockEngineHttpClient } from './http/mock/mock-http.service';
import { EngineSystemsService } from './http/services/systems/systems.service';
import { EngineBindingService } from './websocket/binding.service';
import { MockEngineWebsocket } from './websocket/mock/mock-websocket.class';
import { EngineWebsocket } from './websocket/websocket.class';

import { EngineApplicationsService } from './http/services/applications/applications.service';
import { EngineDomainsService } from './http/services/domains/domains.service';
import { EngineDriversService } from './http/services/drivers/drivers.service';
import { EngineModulesService } from './http/services/modules/modules.service';
import { EngineRepositoriesService } from './http/services/repositories/repositories.service';
import { EngineSettingsService } from './http/services/settings/settings.service';
import { EngineSystemTriggersService } from './http/services/triggers/system-triggers.service';
import { EngineTriggersService } from './http/services/triggers/triggers.service';
import { EngineUsersService } from './http/services/users/users.service';
import { EngineZonesService } from './http/services/zones/zones.service';
import { EngineWebsocketOptions } from './websocket/websocket.interfaces';

import { EngineLDAPSourcesService } from './http/services/ldap-sources/ldap-sources.service';
import { EngineOAuthSourcesService } from './http/services/oauth-sources/oauth-sources.service';
import { EngineSAMLSourcesService } from './http/services/saml-sources/saml-sources.service';

export interface ACAEngineOptions extends EngineAuthOptions {
    /** Whether to use https/wss protocols */
    secure?: boolean;
}

export class ACAEngine {

    /** HTTP Client for making request with ACAEngine credentials */
    public static get http(): EngineHttpClient {
        return this.checkProperty(this._http);
    }

    /** Authentication service for ACAEngine */
    public static get auth(): EngineAuthService {
        return this.checkProperty(this._auth_service);
    }

    /** Service for binding to engine's realtime API */
    public static get bindings(): EngineBindingService {
        return this.checkProperty(this._binding_service);
    }

    /** Interface for engine realtime API communications */
    public static get realtime(): EngineWebsocket {
        return this.checkProperty(this._websocket);
    }

    /** HTTP service for engine applications */
    public static get applications(): EngineApplicationsService {
        return this.checkProperty(this._applications);
    }

    /** HTTP service for engine OAuth authentication sources */
    public static get oauth_sources(): EngineOAuthSourcesService {
        return this.checkProperty(this._oauth_sources);
    }

    /** HTTP service for engine SAML authentication sources */
    public static get saml_sources(): EngineSAMLSourcesService {
        return this.checkProperty(this._saml_sources);
    }

    /** HTTP service for engine LDAP authentication sources */
    public static get ldap_sources(): EngineLDAPSourcesService {
        return this.checkProperty(this._ldap_sources);
    }

    /** HTTP service for engine domains */
    public static get domains(): EngineDomainsService {
        return this.checkProperty(this._domains);
    }

    /** HTTP service for engine drivers */
    public static get drivers(): EngineDriversService {
        return this.checkProperty(this._drivers);
    }

    /** HTTP service for engine modules */
    public static get modules(): EngineModulesService {
        return this.checkProperty(this._modules);
    }

    /** HTTP service for engine systems */
    public static get repositories(): EngineRepositoriesService {
        return this.checkProperty(this._repositories);
    }

    /** HTTP service for engine systems */
    public static get systems(): EngineSystemsService {
        return this.checkProperty(this._systems);
    }

    public static get triggers(): EngineTriggersService {
        return this.checkProperty(this._triggers);
    }

    public static get system_triggers(): EngineSystemTriggersService {
        return this.checkProperty(this._system_triggers);
    }

    /** HTTP service for engine auth sources */
    public static get users(): EngineUsersService {
        return this.checkProperty(this._users);
    }

    /** HTTP service for engine settings */
    public static get settings(): EngineSettingsService {
        return this.checkProperty(this._settings);
    }

    /** HTTP service for engine auth sources */
    public static get zones(): EngineZonesService {
        return this.checkProperty(this._zones);
    }

    /** Observable for the intialised state of ACAEngine */
    public static get initialised(): Observable<boolean> {
        return this._initialised.asObservable();
    }

    /** Intialised state of ACAEngine */
    public static get is_initialised(): boolean {
        return this._initialised.getValue();
    }

    /**
     * Initialise ACAEngine services
     * @param options
     */
    public static init(options: ACAEngineOptions) {
        this.clear();
        this._auth_service = new EngineAuthService(options);
        this._sub = this._auth_service.online_state.subscribe(state => {
            /* istanbul ignore else */
            if (state) {
                // Initialise websocket API
                const websocket_options: EngineWebsocketOptions = {
                    fixed: this._auth_service.fixed_device,
                    host: options.host || location.host
                };
                this._websocket =
                    options.mock !== true
                        ? new EngineWebsocket(this._auth_service, websocket_options)
                        : new MockEngineWebsocket(this._auth_service, websocket_options);
                this._binding_service = new EngineBindingService(this._websocket);
                // Initialise HTTP API
                this._http =
                    options.mock !== true
                        ? new EngineHttpClient(this._auth_service)
                        : new MockEngineHttpClient(this._auth_service);
                // Initialise HTTP services
                this._applications = new EngineApplicationsService(this._http);
                this._oauth_sources = new EngineOAuthSourcesService(this._http);
                this._saml_sources = new EngineSAMLSourcesService(this._http);
                this._ldap_sources = new EngineLDAPSourcesService(this._http);
                this._domains = new EngineDomainsService(this._http);
                this._drivers = new EngineDriversService(this._http);
                this._modules = new EngineModulesService(this._http);
                this._repositories = new EngineRepositoriesService(this._http);
                this._systems = new EngineSystemsService(this._http);
                this._users = new EngineUsersService(this._http);
                this._settings = new EngineSettingsService(this._http);
                this._system_triggers = new EngineSystemTriggersService(this._http);
                this._triggers = new EngineTriggersService(this._http);
                this._zones = new EngineZonesService(this._http);
                this._initialised.next(true);
                if (this._sub) {
                    this._sub.unsubscribe();
                }
            }
        });
    }
    /** Subject for the initialised state of ACAEngine */
    private static _initialised = new BehaviorSubject(false);
    /** HTTP Client for request with ACAEngine credentials */
    private static _http: EngineHttpClient;
    /** Authentication service for ACAEngine */
    private static _auth_service: EngineAuthService;
    /** Service for binding to engine's realtime API */
    private static _binding_service: EngineBindingService;
    /** Websocket for engine realtime API communications */
    private static _websocket: EngineWebsocket;
    /** HTTP service for engine applications */
    private static _applications: EngineApplicationsService;
    /** HTTP service for engine OAuth authentication sources */
    private static _oauth_sources: EngineOAuthSourcesService;
    /** HTTP service for engine SAML authentication sources */
    private static _saml_sources: EngineSAMLSourcesService;
    /** HTTP service for engine LDAP authentication sources */
    private static _ldap_sources: EngineLDAPSourcesService;
    /** HTTP service for engine domains */
    private static _domains: EngineDomainsService;
    /** HTTP service for engine drivers */
    private static _drivers: EngineDriversService;
    /** Http service for engine modules */
    private static _modules: EngineModulesService;
    /** HTTP service for engine repositories */
    private static _repositories: EngineRepositoriesService;
    /** HTTP service for engine systems */
    private static _systems: EngineSystemsService;
    /** HTTP service for engine system triggers */
    private static _system_triggers: EngineSystemTriggersService;
    /** HTTP service for engine triggers */
    private static _triggers: EngineTriggersService;
    /** HTTP service for engine users */
    private static _users: EngineUsersService;
    /** HTTP service for engine settings */
    private static _settings: EngineSettingsService;
    /** HTTP service for engine zones */
    private static _zones: EngineZonesService;
    /** Initialisation subscription */
    private static _sub: Subscription;

    /**
     * Remove any old services
     */
    private static clear() {
        const keys = [
            '_auth_service',
            '_http',
            '_websocket',
            '_binding_service',
            '_application',
            '_auth_sources',
            '_domains',
            '_drivers',
            '_modules',
            '_repositories',
            '_systems',
            '_triggers',
            '_system_triggers',
            '_settings',
            '_users',
            '_zones'
        ];
        for (const key of keys) {
            if (key && (this as any)[key]) {
                if ((this as any)[key].destroy instanceof Function) {
                    (this as any)[key].destroy();
                }
                delete (this as any)[key];
            }
        }
        this._initialised.next(false);
    }

    private static checkProperty<T>(prop: T) {
        if (!prop) {
            throw new Error(
                'ACAEngine hasn\'t been initialised yet. Call `ACAEngine.init` to initialise ACAEngine'
            );
        }
        return prop;
    }

    constructor() {
        throw new Error('No constructor for static class');
    }
}
