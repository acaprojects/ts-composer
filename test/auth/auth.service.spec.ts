import { of, throwError } from 'rxjs';

import { engine, EngineAuthService } from '../../src/auth/auth.service';
import { EngineAuthority } from '../../src/auth/auth.interfaces';

import * as dayjs from 'dayjs';

declare let global: any;

describe('EngineAuthService', () => {
    let service: EngineAuthService;
    let authority: EngineAuthority;
    let href: string;
    let spy: jest.SpyInstance;
    let storage: jest.SpyInstance;

    function newService() {
        return new EngineAuthService({
            auth_uri: '/auth/oauth/authorize',
            token_uri: '/auth/token',
            redirect_uri: 'http://localhost:8080/oauth-resp.html',
            scope: 'any'
        });
    }

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
        spy = jest.spyOn(engine.ajax, 'get');
        storage = jest.spyOn(Object.getPrototypeOf(localStorage), 'getItem');
        spy.mockImplementation(() => of({ responseText: JSON.stringify(authority) }));
        href = location.href;
        localStorage.clear();
        global.location.assign = jest.fn();
    });

    afterEach(() => {
        spy.mockReset();
        storage.mockReset();
        spy.mockRestore();
        storage.mockRestore();
    });

    it('should get the authority', done => {
        spy.mockImplementation(() => throwError({ responseText: JSON.stringify(authority) }));
        jest.useFakeTimers();
        service = newService();
        expect(spy).toBeCalledWith('/auth/authority');
        expect(service.authority).toBeFalsy();
        spy.mockImplementation(() => of({ responseText: JSON.stringify(authority) }));
        setTimeout(() => {
            expect(service.authority).toBeTruthy();
            done();
        }, 1000);
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("should redirect to login page user isn't authorised", done => {
        service = newService();
        setTimeout(() => {
            expect(global.location.assign).toBeCalledWith(
                `/login?continue=${encodeURIComponent(href)}`
            );
            done();
        }, 1);
    });

    it('should redirect to authorise if user is logged in but without a token', done => {
        spy.mockImplementation(() =>
            of({ responseText: JSON.stringify({ ...authority, session: true }) })
        );
        service = newService();
        setTimeout(() => {
            expect(location.assign).toBeCalledWith(
                `/auth/oauth/authorize?` +
                    `response_type=${encodeURIComponent('token')}` +
                    `&client_id=${encodeURIComponent(service.client_id)}` +
                    `&state=${encodeURIComponent(
                        localStorage.getItem(`${service.client_id}_nonce`) || ''
                    )}` +
                    `&redirect_uri=${encodeURIComponent(`http://localhost:8080/oauth-resp.html`)}` +
                    `&scope=${encodeURIComponent('any')}`
            );
            done();
        }, 1);
    });

    it('should handle auth URL parameters', done => {
        window.history.pushState(
            {},
            'Test Title',
            '/not-login.html?access_token=test&expires_in=3600&refresh_token=refresh&trust=true&fixed_device=true&state=nonce;other'
        );
        storage.mockImplementationOnce(() => '').mockImplementationOnce(() => 'nonce');
        service = newService();
        const date = dayjs()
            .add(3600, 's')
            .startOf('s');
        setTimeout(() => {
            expect(service.token).toBe('test');
            expect(service.refresh_token).toBe('refresh');
            expect(+(localStorage.getItem(`${service.client_id}_expires_at`) || 0)).toBe(
                date.valueOf()
            );
            expect(service.trusted).toBeTruthy();
            expect(service.fixed_device).toBeTruthy();
            done();
        }, 1);
    });

    it('should expose the access token', done => {
        window.history.pushState(
            {},
            'Test Title',
            '/not-login.html?access_token=test&expires_in=3600'
        );
        storage.mockImplementationOnce(() => '').mockImplementationOnce(() => 'nonce');
        service = newService();
        setTimeout(() => {
            expect(service.has_token).toBeTruthy();
            expect(service.token).toBe('test');
            done();
        }, 1);
    });

    it('should generate tokens from code', done => {
        let post_spy = jest.spyOn(engine.ajax, 'post');
        post_spy.mockImplementation(
            () =>
                of({
                    responseText: JSON.stringify({
                        access_token: ':)',
                        refresh_token: 'Refresh :|',
                        expires_in: 3600
                    })
                }) as any
        );
        window.history.pushState({}, 'Test Title', '/not-login.html?code=test');
        service = newService();
        setTimeout(() => {
            expect(post_spy).toBeCalledWith(
                `/auth/token?client_id=${
                    service.client_id
                }&code=test&grant_type=authorization_code`,
                ''
            );
            expect(service.token).toBe(':)');
            expect(service.refresh_token).toBe('Refresh :|');
            done();
        }, 1);
    });

    it('should generate tokens from refresh token', done => {
        let post_spy = jest.spyOn(engine.ajax, 'post');
        post_spy.mockImplementation(
            () =>
                of({
                    responseText: JSON.stringify({
                        access_token: ':)',
                        refresh_token: 'Refresh :|',
                        expires_in: 3600
                    })
                }) as any
        );
        window.history.pushState({}, 'Test Title', '/not-login.html?refresh_token=test');
        service = newService();
        setTimeout(() => {
            expect(post_spy).toBeCalledWith(
                `/auth/token?client_id=${
                    service.client_id
                }&refresh_token=test&grant_type=refresh_token`,
                ''
            );
            expect(service.token).toBe(':)');
            expect(service.refresh_token).toBe('Refresh :|');
            done();
        }, 1);
    });

    it('should expose the online state of engine', done => {
        service = newService();
        expect(service.is_online).toBeTruthy();
        spy.mockImplementation(() =>
            throwError({ status: 502, responseText: JSON.stringify(authority) })
        );
        service.refreshAuthority();
        expect(service.is_online).toBeFalsy();
        service.online_state.subscribe(state => {
            expect(state).toBeFalsy();
            done();
        });
    });

    it('should allow logging out', () => {
        window.history.pushState(
            {},
            'Test Title',
            '/not-login.html?access_token=:S&expires_in=3600'
        );
        service = newService();
        expect(service.token).toBe(':S');
        service.logout();
        expect(service.token).toBeFalsy();
        expect(location.assign).toBeCalledWith('/logout');
    });
});
