import { of } from 'rxjs';

import { engine } from '../src/auth/auth.service';
import { Composer } from '../src/composer';

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
import { EngineTriggersService } from '../src/http/services/triggers/triggers.service';
import { EngineUsersService } from '../src/http/services/users/users.service';
import { EngineZonesService } from '../src/http/services/zones/zones.service';
import { EngineBindingService } from '../src/websocket/binding.service';
import { MockEngineWebsocket } from '../src/websocket/mock/mock-websocket.class';
import { EngineWebsocket } from '../src/websocket/websocket.class';

describe('Composer', () => {
    it('constuctor throws error', () => {
        expect(() => new Composer()).toThrow();
    });

    it('services throw errors before intialisation', () => {
        expect(() => Composer.auth).toThrow();
        expect(() => Composer.applications).toThrow();
        expect(() => Composer.auth_sources).toThrow();
        expect(() => Composer.bindings).toThrow();
        expect(() => Composer.domains).toThrow();
        expect(() => Composer.drivers).toThrow();
        expect(() => Composer.http).toThrow();
        expect(() => Composer.modules).toThrow();
        expect(() => Composer.realtime).toThrow();
        expect(() => Composer.systems).toThrow();
        expect(() => Composer.users).toThrow();
        expect(() => Composer.zones).toThrow();
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
            window.history.pushState({}, 'Test Composer', '?access_token=hello&expires_in=3600');
            spy = jest.spyOn(engine.ajax, 'get');
            spy.mockImplementation(() => of({ response: authority }));
            jest.useFakeTimers();
            Composer.init({
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

        it('should expose realtime API services', () => {
            expect(Composer.bindings).toBeInstanceOf(EngineBindingService);
            expect(Composer.realtime).toBeInstanceOf(EngineWebsocket);
        });

        it('should expose HTTP API services', () => {
            expect(Composer.http).toBeInstanceOf(EngineHttpClient);
            expect(Composer.applications).toBeInstanceOf(EngineApplicationsService);
            expect(Composer.auth_sources).toBeInstanceOf(EngineAuthSourcesService);
            expect(Composer.domains).toBeInstanceOf(EngineDomainsService);
            expect(Composer.drivers).toBeInstanceOf(EngineDriversService);
            expect(Composer.modules).toBeInstanceOf(EngineModulesService);
            expect(Composer.repositories).toBeInstanceOf(EngineRepositoriesService);
            expect(Composer.settings).toBeInstanceOf(EngineSettingsService);
            expect(Composer.systems).toBeInstanceOf(EngineSystemsService);
            expect(Composer.triggers).toBeInstanceOf(EngineTriggersService);
            expect(Composer.users).toBeInstanceOf(EngineUsersService);
            expect(Composer.zones).toBeInstanceOf(EngineZonesService);
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
            window.history.pushState({}, 'Test Composer', '?access_token=hello&expires_in=3600');
            spy = jest.spyOn(engine.ajax, 'get');
            spy.mockImplementation(() => of({ response: authority }));
            jest.useFakeTimers();
            Composer.init({
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
            expect(Composer.http).toBeInstanceOf(MockEngineHttpClient);
            expect(Composer.realtime).toBeInstanceOf(MockEngineWebsocket);
        });
    });
});
