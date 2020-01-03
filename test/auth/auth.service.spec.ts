import { of, throwError } from 'rxjs';

import { EngineAuthority } from '../../src/auth/auth.interfaces';
import { engine, EngineAuthService } from '../../src/auth/auth.service';

import * as dayjs from 'dayjs';

declare let global: any;

describe('EngineAuthService', () => {
    let service: EngineAuthService;
    let authority: EngineAuthority;
    let href: string;
    let spy: jest.SpyInstance;
    let post_spy: jest.SpyInstance;
    let storage: jest.SpyInstance;
    let storage_set: jest.SpyInstance;

    function newService(local: boolean = true) {
        return new EngineAuthService({
            auth_uri: '/auth/oauth/authorize',
            token_uri: '/auth/token',
            redirect_uri: 'http://localhost:8080/oauth-resp.html',
            scope: 'any',
            storage: local ? 'local' : 'session'
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
            config: {},
            version: `2.0.0`
        };
        spy = jest.spyOn(engine.ajax, 'get');
        post_spy = jest.spyOn(engine.ajax, 'post');
        storage = jest.spyOn(Object.getPrototypeOf(localStorage), 'getItem');
        storage_set = jest.spyOn(Object.getPrototypeOf(localStorage), 'setItem');
        spy.mockImplementation(() => of({ response: authority }));
        href = location.href;
        localStorage.clear();
        global.location.assign = jest.fn();
    });

    afterEach(() => {
        spy.mockRestore();
        storage.mockRestore();
        storage_set.mockRestore();
        post_spy.mockRestore();
    });

    it('should expose the API endpoint', () => {
        service = newService();
        expect(service.api_endpoint).toBe(`${location.origin}/api/engine/v2`);
    });

    it('should get the authority', done => {
        // spy.mockImplementation(() => of({ response: undefined }));
        // service = newService();
        // expect(spy).toBeCalledWith('/auth/authority');
        // expect(service.authority).toBeFalsy();
        // spy.mockImplementation(() => of({ response: authority }));
        // service.online_state.subscribe((state) => {
        //     console.log('State:', state, '\n\n\n\n\n\n\n\n');
        //     if (state) {
        //         expect(service.authority).toBeTruthy();
        //         done();
        //     }
        // });
        done();
    });

    it('should redirect to login page user isn\'t authorised', done => {
        service = newService();
        setTimeout(() => {
            expect(global.location.assign).toBeCalledWith(
                `/login?continue=${encodeURIComponent(href)}`
            );
            done();
        }, 301);
    });

    it('should redirect to authorise if user is logged in but without a token', done => {
        spy.mockImplementation(() => of({ response: { ...authority, session: true } }));
        service = newService(false);
        setTimeout(() => {
            expect(location.assign).toBeCalledWith(
                `/auth/oauth/authorize?` +
                    `response_type=${encodeURIComponent('token')}` +
                    `&client_id=${encodeURIComponent(service.client_id)}` +
                    `&state=${encodeURIComponent(
                        sessionStorage.getItem(`${service.client_id}_nonce`) || ''
                    )}` +
                    `&redirect_uri=${encodeURIComponent(`http://localhost:8080/oauth-resp.html`)}` +
                    `&scope=${encodeURIComponent('any')}`
            );
            done();
        }, 500);
    });

    it('should handle auth URL parameters', done => {
        spy.mockImplementation(() => of({ response: { ...authority, session: true } }));
        window.history.pushState(
            {},
            'Test Title',
            '/not-login.html?access_token=test&expires_in=3600&refresh_token=refresh&trust=true&fixed_device=true&state=;other'
        );
        storage.mockImplementation(() => '');
        service = newService();
        const date = dayjs()
            .add(3600, 's')
            .startOf('s');
        service.online_state.subscribe(online => {
            if (online) {
                expect(localStorage.setItem).toBeCalledWith(`${service.client_id}_access_token`, 'test');
                expect(localStorage.setItem).toBeCalledWith(`${service.client_id}_refresh_token`, 'refresh');
                expect(localStorage.setItem).toBeCalledWith(`${service.client_id}_expires_at`, `${date.valueOf()}`);
                expect(service.trusted).toBeTruthy();
                expect(service.fixed_device).toBeTruthy();
                done();
            }
        });
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
        post_spy.mockImplementation(
            () =>
                of({
                    response: {
                        access_token: ':)',
                        refresh_token: 'Refresh :|',
                        expires_in: 3600
                    }
                }) as any
        );
        window.history.pushState({}, 'Test Title', '/not-login.html?code=test');
        service = newService();
        setTimeout(() => {
            expect(post_spy).toBeCalledWith(
                `/auth/token?client_id=${service.client_id}&redirect_uri=${encodeURIComponent(
                    service.redirect_uri
                )}&code=test&grant_type=authorization_code`,
                ''
            );
            expect(service.token).toBe(':)');
            expect(service.refresh_token).toBe('Refresh :|');
            done();
        }, 1);
    });

    it('should generate tokens from refresh token', done => {
        post_spy.mockImplementation(
            () =>
                of({
                    response: {
                        access_token: ':)',
                        refresh_token: 'Refresh :|',
                        expires_in: 3600
                    }
                }) as any
        );
        window.history.pushState({}, 'Test Title', '/not-login.html?refresh_token=test');
        service = newService();
        setTimeout(() => {
            expect(post_spy).toBeCalledWith(
                `/auth/token?client_id=${service.client_id}&redirect_uri=${encodeURIComponent(
                    service.redirect_uri
                )}&refresh_token=test&grant_type=refresh_token`,
                ''
            );
            expect(service.token).toBe(':)');
            expect(service.refresh_token).toBe('Refresh :|');
            done();
        }, 1);
    });

    it('should expose the online state of engine', done => {
        service = newService();
        let count = 0;
        service.online_state.subscribe(state => {
            if (count === 0) {
                expect(state).toBeFalsy();
            } else if (count === 1) {
                expect(state).toBeTruthy();
            } else if (count === 2) {
                expect(state).toBeFalsy();
                done();
            }
            count++;
        });
        setTimeout(() => {
            spy.mockImplementation(() =>
                throwError({ status: 502, responseText: JSON.stringify(authority) })
            );
            (service as any)._promises.load_authority = null;
            service.refreshAuthority();
        }, 101);
    });

    it('should allow logging out', done => {
        post_spy.mockImplementation(() => of({}));
        window.history.pushState(
            {},
            'Test Title',
            '/not-login.html?access_token=:S&expires_in=3600'
        );
        service = newService();
        let count = 0;
        service.online_state.subscribe(online => {
            if (online) {
                expect(service.token).toBe(':S');
                service.logout();
                count++;
            } else if (count > 0) {
                setTimeout(() => {
                    expect(engine.ajax.post).toBeCalledWith(`/auth/token?token=:S`, '');
                    expect(location.assign).toBeCalledWith('/logout');
                    done();
                }, 500);
            }
        });
    });
});
