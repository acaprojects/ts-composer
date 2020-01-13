import { of } from 'rxjs';

import { EngineRepositoriesService } from '../../../../src/http/services/repositories/repositories.service';
import { EngineRepository } from '../../../../src/http/services/repositories/repository.class';

import * as dayjs from 'dayjs';

describe('EngineRepositoriesService', () => {
    let service: EngineRepositoriesService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineRepositoriesService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineRepositoriesService);
    });

    it('should allow querying repositories index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/repositories');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineRepository);
    });

    it('should allow querying repositories show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/repositories/test');
        expect(result).toBeInstanceOf(EngineRepository);
    });

    it('should allow querying the driver list for a repository', async () => {
        http.get.mockReturnValueOnce(of(['path/to/driver.cr']));
        const result = await service.listDrivers('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/repositories/test/drivers');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBe('path/to/driver.cr');
    });

    it('should allow querying the commit list for a repository', async () => {
        const commit = {
            commit: 'hash',
            date: dayjs().unix(),
            author: 'John',
            subject: 'Best commit ever!!!'
        };
        http.get.mockReturnValueOnce(of([commit]));
        const result = await service.listCommits('test', { driver: 'test' });
        expect(http.get).toBeCalledWith('/api/engine/v2/repositories/test/commits?driver=test');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBe(commit);
    });

    it('should allow querying a driver\'s details for a repository commit', async () => {
        const driver = {
            descriptive_name: 'Screen Technics Control',
            generic_name: 'Screen',
            tcp_port: 3001,
            default_settings: '{"json": "formatted hash"}',
            description: 'to be considered markdown format',
            udp_port: 3001,
            uri_base: 'https://twitter.com',
            makebreak: true
        };
        http.get.mockReturnValueOnce(of(driver));
        const result = await service.driverDetails('test', { driver: 'test', commit: 'hash' });
        expect(http.get).toBeCalledWith('/api/engine/v2/repositories/test/details?driver=test&commit=hash');
        expect(result).toBeInstanceOf(Object);
        expect(result).toBe(driver);
    });
});
