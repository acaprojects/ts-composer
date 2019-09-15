import { of, throwError } from 'rxjs'

import { engine, EngineAuthService } from '../../src/auth/auth.service'
import { EngineAuthority } from '../../src/auth/auth.interfaces'

import * as dayjs from 'dayjs'

describe('EngineAuthService', () => {
    let service: EngineAuthService
    let authority: EngineAuthority
    let href: string
    let spy: any

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
        }
        spy = jest.spyOn(engine.ajax, 'get')
        spy.mockImplementation(() => of({ responseText: JSON.stringify(authority) }))
        window.history.pushState({}, 'Test Title', '/not-login.html')
        href = location.href
        localStorage.clear()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should get the authority', done => {
        spy.mockImplementation(() => throwError({ responseText: JSON.stringify(authority) }))
        service = new EngineAuthService({
            token_uri: '/auth/token',
            redirect_uri: 'http://localhost:8080/oauth-resp.html',
            scope: 'any'
        })
        expect(spy).toBeCalledWith('/auth/authority')
        expect(service.authority).toBeFalsy()
        spy.mockImplementation(() => of({ responseText: JSON.stringify(authority) }))
        setTimeout(() => {
            expect(service.authority).toBeTruthy()
            done()
        }, 1000)
        jest.runOnlyPendingTimers()
    })

    it("should redirect to login page user isn't authorised", () => {
        service = new EngineAuthService({
            token_uri: '/auth/token',
            redirect_uri: 'http://localhost:8080/oauth-resp.html',
            scope: 'any'
        })
        setTimeout(() => {
            expect(location.href).toContain(`/login?continue=${encodeURIComponent(href)}`)
            expect(location.href).toContain(`response_type=token`)
            expect(location.href).toContain(`client_id=${encodeURIComponent(service.client_id)}`)
            expect(location.href).toContain(
                `redirect_uri=${encodeURIComponent(`http://localhost:8080/oauth-resp.html`)}`
            )
            expect(location.href).toContain(`scope=${encodeURIComponent(`any`)}`)
        }, 1000)
        jest.runOnlyPendingTimers()
    })

    it('should handle auth URL parameters', () => {
        window.history.pushState(
            {},
            'Test Title',
            '/not-login.html?access_token=test&expires_in=3600&refresh_token=refresh'
        )
        service = new EngineAuthService({
            token_uri: '/auth/token',
            redirect_uri: 'http://localhost:8080/oauth-resp.html',
            scope: 'any'
        })
        expect(service.token).toBe('test')
        expect(service.refresh_token).toBe('refresh')
        expect(+(localStorage.getItem(`${service.client_id}_expires_at`) || 0)).toBe(
            dayjs()
                .add(3600, 's')
                .valueOf()
        )
    })

    it('should return the access token', () => {
        window.history.pushState(
            {},
            'Test Title',
            '/not-login.html?access_token=test&expires_in=3600'
        )
        service = new EngineAuthService({
            token_uri: '/auth/token',
            redirect_uri: 'http://localhost:8080/oauth-resp.html',
            scope: 'any'
        })
        expect(service.token).toBe('test')
    })

    it('should refresh tokens', () => {})
})
