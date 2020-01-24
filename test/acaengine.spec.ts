import { of } from 'rxjs';

import { ACAEngine } from '../src/acaengine';
import { engine } from '../src/auth/auth.service';

import { EngineAuthority } from '../src/auth/auth.interfaces';
import { EngineHttpClient } from '../src/http/http.service';
import { MockEngineHttpClient } from '../src/http/mock/mock-http.service';
import { EngineApplicationsService } from '../src/http/services/applications/applications.service';
import { EngineAuthSourcesService } from '../src/http/services/auth-sources/auth-sources.service';
import { EngineDomainsService } from '../src/http/services/domains/domains.service';
import { EngineDriversService } from '../src/http/services/drivers/drivers.service';
import { EngineModulesService } from '../src/http/services/modules/modules.service';
import { EngineRepositoriesService } from '../src/http/services/repositories/repositories.service';
import { EngineSettingsService } from '../src/http/services/settings/settings.service';
import { EngineSystemsService } from '../src/http/services/systems/systems.service';
import { EngineSystemTriggersService } from '../src/http/services/triggers/system-triggers.service';
import { EngineTriggersService } from '../src/http/services/triggers/triggers.service';
import { EngineUsersService } from '../src/http/services/users/users.service';
import { EngineZonesService } from '../src/http/services/zones/zones.service';
import { EngineBindingService } from '../src/websocket/binding.service';
import { MockEngineWebsocket } from '../src/websocket/mock/mock-websocket.class';
import { EngineWebsocket } from '../src/websocket/websocket.class';

describe('ACAEngine', () => {
    it('constuctor throws error', () => {
        expect(() => new ACAEngine()).toThrow();
    });

    it('services throw errors before intialisation', () => {
        expect(() => ACAEngine.auth).toThrow();
        expect(() => ACAEngine.applications).toThrow();
        expect(() => ACAEngine.auth_sources).toThrow();
        expect(() => ACAEngine.bindings).toThrow();
        expect(() => ACAEngine.domains).toThrow();
        expect(() => ACAEngine.drivers).toThrow();
        expect(() => ACAEngine.http).toThrow();
        expect(() => ACAEngine.modules).toThrow();
        expect(() => ACAEngine.realtime).toThrow();
        expect(() => ACAEngine.systems).toThrow();
        expect(() => ACAEngine.users).toThrow();
        expect(() => ACAEngine.zones).toThrow();
    });

    describe('services', () => {
        let authority: EngineAuthority;
        let spy: jest.SpyInstance;

        beforeEach(() => {
            authority = {
                id: 'test-authority',
                name: 'localhost:4200',
                description: '',
                dom: 'localhost:4200',
                login_url: `/login?continue={{url}}`,
                logout_url: `/logout`,
                session: false,
                production: false,
                config: {}
            };
            window.history.pushState({}, 'Test ACAEngine', '?access_token=hello&expires_in=3600');
            spy = jest.spyOn(engine.ajax, 'get');
            spy.mockImplementation(() => of({ response: authority }));
            jest.useFakeTimers();
            ACAEngine.init({
                auth_uri: '/auth/oauth/authorize',
                token_uri: '/auth/token',
                redirect_uri: 'http://localhost:8080/oauth-resp.html',
                scope: 'any'
            });
            jest.runOnlyPendingTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should initialise', () => {
            expect(ACAEngine.is_initialised).toBe(true);
        });

        it('should expose realtime API services', () => {
            expect(ACAEngine.bindings).toBeInstanceOf(EngineBindingService);
            expect(ACAEngine.realtime).toBeInstanceOf(EngineWebsocket);
        });

        it('should expose HTTP API services', () => {
            expect(ACAEngine.http).toBeInstanceOf(EngineHttpClient);
            expect(ACAEngine.applications).toBeInstanceOf(EngineApplicationsService);
            expect(ACAEngine.auth_sources).toBeInstanceOf(EngineAuthSourcesService);
            expect(ACAEngine.domains).toBeInstanceOf(EngineDomainsService);
            expect(ACAEngine.drivers).toBeInstanceOf(EngineDriversService);
            expect(ACAEngine.modules).toBeInstanceOf(EngineModulesService);
            expect(ACAEngine.repositories).toBeInstanceOf(EngineRepositoriesService);
            expect(ACAEngine.settings).toBeInstanceOf(EngineSettingsService);
            expect(ACAEngine.systems).toBeInstanceOf(EngineSystemsService);
            expect(ACAEngine.system_triggers).toBeInstanceOf(EngineSystemTriggersService);
            expect(ACAEngine.triggers).toBeInstanceOf(EngineTriggersService);
            expect(ACAEngine.users).toBeInstanceOf(EngineUsersService);
            expect(ACAEngine.zones).toBeInstanceOf(EngineZonesService);
        });
    });

    describe('mocking services', () => {
        let authority: EngineAuthority;
        let spy: jest.SpyInstance;

        beforeEach(() => {
            authority = {
                id: 'test-authority',
                name: 'localhost:4200',
                description: '',
                dom: 'localhost:4200',
                login_url: `/login?continue={{url}}`,
                logout_url: `/logout`,
                session: false,
                production: false,
                config: {}
            };
            window.history.pushState({}, 'Test ACAEngine', '?access_token=hello&expires_in=3600');
            spy = jest.spyOn(engine.ajax, 'get');
            spy.mockImplementation(() => of({ response: authority }));
            jest.useFakeTimers();
            ACAEngine.init({
                auth_uri: '/auth/oauth/authorize',
                token_uri: '/auth/token',
                redirect_uri: 'http://localhost:8080/oauth-resp.html',
                scope: 'any',
                mock: true
            });
            jest.runOnlyPendingTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should be using mock services', () => {
            expect(ACAEngine.http).toBeInstanceOf(MockEngineHttpClient);
            expect(ACAEngine.realtime).toBeInstanceOf(MockEngineWebsocket);
        });
    });
});
