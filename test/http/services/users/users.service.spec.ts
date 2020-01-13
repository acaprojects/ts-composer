import { of } from 'rxjs';

import { EngineUser } from '../../../../src/http/services/users/user.class';
import { EngineUsersService } from '../../../../src/http/services/users/users.service';

describe('EngineUsersService', () => {
    let service: EngineUsersService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineUsersService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineUsersService);
    });

    it('should allow querying users index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/users');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineUser);
    });

    it('should allow querying users show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/users/test');
        expect(result).toBeInstanceOf(EngineUser);
    });

    it('should allow querying current user', async () => {
        http.get.mockReturnValueOnce(of({ id: 'current' }));
        const result = await service.current();
        expect(http.get).toBeCalledWith('/api/engine/v2/users/current');
        expect(result).toBeInstanceOf(EngineUser);
    });
});
