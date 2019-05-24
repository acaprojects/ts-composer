
import { engine, EngineAuthService } from '../../src/auth/auth.service';


describe('EngineAuthService', () => {
    let service: EngineAuthService;

    beforeEach(() => {
        spyOn(engine, 'ajax');
        localStorage.clear();
        service = new EngineAuthService({
            token_uri: '/auth/token',
            redirect_uri: 'http://localhost:8080/oauth-resp.html',
            scope: 'any'
        });
    });

    it('should get the authority', () => {

    });

    it('should return the access token', () => {

    });

    it('should handle auth URL parameters', () => {

    });

    it('should refresh tokens', () => {

    });
});
