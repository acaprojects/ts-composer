import { of } from 'rxjs';
import { EngineSystem } from '../../../../src/http/services/systems/system.class';
import { EngineSystemsService } from '../../../../src/http/services/systems/systems.service';

describe('EngineSystemsService', () => {
    let service: EngineSystemsService;
    let http: any;

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new EngineSystemsService(http);
    });

    it('should create instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineSystemsService);
    });

    it('allow querying systems index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }));
        const result = await service.query();
        expect(http.get).toBeCalledWith('/api/engine/v2/systems');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(EngineSystem);
    });

    it('allow querying systems show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }));
        const result = await service.show('test');
        expect(http.get).toBeCalledWith('/api/engine/v2/systems/test');
        expect(result).toBeInstanceOf(EngineSystem);
    });

    it('allow removing modules', async () => {
        http.post.mockReturnValueOnce(of(null));
        await service.remove('test', 'module_1');
        expect(http.post).toBeCalledWith('/api/engine/v2/systems/test/remove', {
            module_id: 'module_1',
            _task: 'remove',
            id: 'test'
        });
    });

    it('allow starting a system', async () => {
        http.post.mockReturnValueOnce(of(null));
        await service.start('test');
        expect(http.post).toBeCalledWith('/api/engine/v2/systems/test/start', {
            _task: 'start',
            id: 'test'
        });
    });

    it('allow stopping a system', async () => {
        http.post.mockReturnValueOnce(of(null));
        await service.stop('test');
        expect(http.post).toBeCalledWith('/api/engine/v2/systems/test/stop', {
            _task: 'stop',
            id: 'test'
        });
    });

    it('allow counting system modules', async () => {
        http.get.mockReturnValueOnce(of({ count: 0 }));
        const value = await service.count('test', 'Booking');
        expect(http.get).toBeCalledWith('/api/engine/v2/systems/test/count?module=Booking');
        expect(value).toEqual({ count: 0 });
    });

    it('allow executing methods on modules', async () => {
        http.post.mockReturnValueOnce(of('test')).mockReturnValueOnce(of('test2'));
        let resp = await service.execute('test', 'module');
        expect(http.post).toBeCalledWith('/api/engine/v2/systems/test/exec', {
            _task: 'exec',
            id: 'test',
            module: 'module',
            index: 1,
            args: []
        });
        expect(resp).toBe('test');
        resp = await service.execute('test', 'module', 2, ['let', 'me', 'go']);
        expect(http.post).toBeCalledWith('/api/engine/v2/systems/test/exec', {
            _task: 'exec',
            id: 'test',
            module: 'module',
            index: 2,
            args: ['let', 'me', 'go']
        });
        expect(resp).toBe('test2');
    });

    it('allow querying module state', async () => {
        http.get
            .mockReturnValueOnce(of({ test: 'yeah' }))
            .mockReturnValueOnce(of({ test: 'yeah2' }));
        let value = await service.state('test', 'module', 1, 'look');
        expect(http.get).toBeCalledWith(
            `/api/engine/v2/systems/test/state?module=module&index=1&lookup=look`
        );
        expect(value).toEqual({ test: 'yeah' });
        value = await service.state('test', 'module');
        expect(http.get).toBeCalledWith(`/api/engine/v2/systems/test/state?module=module&index=1`);
        expect(value).toEqual({ test: 'yeah2' });
    });

    it('allow querying module methods', async () => {
        http.get
            .mockReturnValueOnce(of({ test: { arity: 1 } }))
            .mockReturnValueOnce(of({ test: { arity: 2 } }));
        let value = await service.functionList('test', 'module');
        expect(http.get).toBeCalledWith(`/api/engine/v2/systems/test/funcs?module=module&index=1`);
        expect(value).toEqual({ test: { arity: 1 } });
        value = await service.functionList('test', 'module', 2);
        expect(http.get).toBeCalledWith(`/api/engine/v2/systems/test/funcs?module=module&index=2`);
        expect(value).toEqual({ test: { arity: 2 } });
    });

    it('allow querying module types', async () => {
        http.get.mockReturnValueOnce(of({ test: 0 }));
        const value = await service.types('test');
        expect(http.get).toBeCalledWith(`/api/engine/v2/systems/test/count`);
        expect(value).toEqual({ test: 0 });
    });
});
