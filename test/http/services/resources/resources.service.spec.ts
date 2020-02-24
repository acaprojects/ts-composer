import { Observable, of, throwError } from 'rxjs';

import { EngineResource } from '../../../../src/http/services/resources/resource.class';
import { EngineResourceService } from '../../../../src/http/services/resources/resources.service';

class ERSInstance extends EngineResourceService<EngineResource<any>> {}

describe('EngineResourceService', () => {
    let service: ERSInstance;
    let http: any;

    async function testRequest(
        method: 'get' | 'post' | 'patch' | 'put' | 'delete',
        fn: any,
        result: any,
        test1: any[],
        test2: any[]
    ) {
        const item = result.hasOwnProperty('results') ? result.results : result;
        http[method]
            .mockReturnValueOnce(of(result))
            .mockReturnValueOnce(of(result))
            .mockReturnValueOnce(throwError('An Error Value'));
        const value = await (service as any)[fn](...test1);
        jest.runOnlyPendingTimers();
        if (method === 'delete') {
            expect(value).toBeFalsy();
        } else {
            expect(value).toEqual(item || []);
        }
        // Test request with parameters
        await (service as any)[fn](...test2);
        jest.runOnlyPendingTimers();
        // Test error handling
        try {
            await (service as any)[fn](...test1);
            throw new Error('Failed to error');
        } catch (e) {
            expect(e).toBe('An Error Value');
        }
        jest.runOnlyPendingTimers();
    }

    beforeEach(() => {
        jest.useFakeTimers();
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
            api_endpoint: '/api/engine/v2'
        };
        service = new ERSInstance(http);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should create an instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(ERSInstance);
    });

    it('should expose initialised state', () => {
        expect(service.initialised).toBeTruthy();
    });

    it('should allow querying the index endpoint', async () => {
        expect.assertions(8);
        const item = { id: 'test', name: 'Test' };
        await testRequest('get', 'query', [item], [], [{ cache: 100, test: true }]);
        await testRequest('get', 'query', { total: 10, results: [item] }, [], [{ test: true }]);
        await testRequest('get', 'query', { total: 10, results: undefined }, [], [{ test: true }]);
        expect(http.get).toBeCalledWith('/api/engine/v2/base');
        expect(http.get).toBeCalledWith('/api/engine/v2/base?test=true');
    });

    it('should save index request totals', async () => {
        expect.assertions(6);
        const item = { id: 'test', name: 'Test' };
        await testRequest('get', 'query', { total: 10, results: [item] }, [{ offset: 10 }], [{ offset: 10 }]);
        await testRequest('get', 'query', { total: 25, results: undefined }, [{ test: true }], [{ test: true }]);
        expect(service.total).toBe(10);
        expect(service.last_total).toBe(25);
    });

    it('should allow for grabbing the show endpoint for an item', async () => {
        expect.assertions(4);
        const item = { id: 'test', name: 'Test' };
        await testRequest('get', 'show', item, ['test'], ['test', { test: true }]);
        expect(http.get).toBeCalledWith('/api/engine/v2/base/test');
        expect(http.get).toBeCalledWith('/api/engine/v2/base/test?test=true');
    });

    it('should allow adding new items', async () => {
        expect.assertions(4);
        const item = { id: 'test', name: 'Test' };
        await testRequest('post', 'add', item, [item], [item, { test: true }]);
        expect(http.post).toBeCalledWith('/api/engine/v2/base', item);
        expect(http.post).toBeCalledWith('/api/engine/v2/base?test=true', item);
    });

    it('should allow running POST tasks on items', async () => {
        expect.assertions(4);
        const item = { id: 'test', name: 'Test' };
        await testRequest(
            'post',
            'task',
            'success',
            ['test', 'a_task'],
            ['test', 'a_task', { test: true }]
        );
        expect(http.post).toBeCalledWith('/api/engine/v2/base/test/a_task', {
            id: 'test',
            _task: 'a_task'
        });
        expect(http.post).toBeCalledWith('/api/engine/v2/base/test/a_task', {
            test: true,
            id: 'test',
            _task: 'a_task'
        });
    });

    it('should allow running GET tasks on items', async () => {
        expect.assertions(4);
        const item = { id: 'test', name: 'Test' };
        await testRequest(
            'get',
            'task',
            'success',
            ['test', 'a_task', null, 'get'],
            ['test', 'a_task', { test: true }, 'get']
        );
        expect(http.get).toBeCalledWith('/api/engine/v2/base/test/a_task');
        expect(http.get).toBeCalledWith('/api/engine/v2/base/test/a_task?test=true');
    });

    it('should allow polling index endpoints', done => {
        const item = { id: 'test', name: 'Test' };
        const spy = spyOn(service, 'query');
        spy.and.returnValue(Promise.resolve(item));
        const obs = service.poll();
        expect(obs).toBeInstanceOf(Observable);
        obs.subscribe(
            value => {
                expect(value).toBe(item);
                jest.runOnlyPendingTimers();
                spy.and.returnValue(Promise.reject('An error :)'));
            },
            e => {
                expect(service.query).toBeCalledTimes(3);
                expect(e).toBe('An error :)');
                done();
            }
        );
    });

    it('should allow polling show endpoints', done => {
        const item = { id: 'test', name: 'Test' };
        const spy = spyOn(service, 'show');
        spy.and.returnValue(Promise.resolve(item));
        const obs = service.poll('test');
        expect(obs).toBeInstanceOf(Observable);
        obs.subscribe(
            value => {
                expect(value).toBe(item);
                jest.runOnlyPendingTimers();
                spy.and.returnValue(Promise.reject('An error :)'));
            },
            e => {
                expect(service.show).toBeCalledTimes(3);
                expect(e).toBe('An error :)');
                done();
            }
        );
    });

    it('should allow cancelling polling', done => {
        const item = { id: 'test', name: 'Test' };
        const spy = spyOn(service, 'show');
        spy.and.returnValue(Promise.resolve(item));
        const obs = service.poll('test', {}, 3000);
        expect(obs).toBeInstanceOf(Observable);
        obs.subscribe(_ => null, _ => null, () => done());
        service.stopPoll('test');
    });

    it('should allow updating items', async () => {
        expect.assertions(4);
        const item = { id: 'test', name: 'Test' };
        await testRequest('patch', 'update', item, ['test', item], ['test', item, { test: true }]);
        expect(http.patch).toBeCalledWith('/api/engine/v2/base/test', item);
        expect(http.patch).toBeCalledWith('/api/engine/v2/base/test?test=true', item);
    });

    it('should allow deleting items', async () => {
        expect.assertions(4);
        const item = { id: 'test', name: 'Test' };
        await testRequest('delete', 'delete', item, ['test'], ['test', { test: true }]);
        expect(http.delete).toBeCalledWith('/api/engine/v2/base/test');
        expect(http.delete).toBeCalledWith('/api/engine/v2/base/test?test=true');
    });
});
