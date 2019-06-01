import { engine, EngineAuthService } from '../../src/auth/auth.service'
import { Observable } from 'rxjs'

describe('EngineAuthService', () => {
    let service: EngineAuthService
    let fake_ajax: Observable<any>

    beforeEach(() => {
        fake_ajax = new Observable<any>()
        spyOn(engine, 'ajax').and.returnValue(fake_ajax)
        localStorage.clear()
        service = new EngineAuthService({
            token_uri: '/auth/token',
            redirect_uri: 'http://localhost:8080/oauth-resp.html',
            scope: 'any'
        })
    })

    it('should get the authority', () => {})

    it('should return the access token', () => {})

    it('should handle auth URL parameters', () => {})

    it('should refresh tokens', () => {})
})
