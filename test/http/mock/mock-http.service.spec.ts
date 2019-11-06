import { of } from 'rxjs';
import { engine_http } from '../../../src/http/http.service';
import { MockHttpRequestHandlerOptions } from '../../../src/http/mock/mock-http.interfaces';
import { MockEngineHttpClient } from '../../../src/http/mock/mock-http.service';

describe('MockEngineHttpClient', () => {
    let auth: any;
    let service: MockEngineHttpClient;
    const global_handlers: MockHttpRequestHandlerOptions[] = [{
        path: 'test/path',
        method: 'GET',
        metadata: {},
        callback: r => 'test'
    }, {
        path: '/test/path2',
        method: 'GET',
        metadata: {},
        callback: r => 'test'
    }];

    beforeEach(() => {
        auth = { has_token: true, refreshAuthority: () => null };
        const global_handler: MockHttpRequestHandlerOptions = {
            path: 'test/path',
            method: 'GET',
            metadata: {},
            callback: r => 'test'
        };
        window.control = { handlers: global_handlers };
        service = new MockEngineHttpClient(auth);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should create an instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(MockEngineHttpClient);
    });

    it('should register global handlers', () => {
        let handler = service.findRequestHandler('GET', 'test/path');
        expect(handler).toBeTruthy();
        handler = service.findRequestHandler('GET', '/test/path');
        expect(handler).toBeTruthy();
        handler = service.findRequestHandler('GET', 'test/path2');
        expect(handler).toBeTruthy();
        handler = service.findRequestHandler('GET', '/test/path2');
        expect(handler).toBeTruthy();
    });

    it('should register new handlers', () => {
        service.register('please/delete/me', null, 'DELETE');
        let handler = service.findRequestHandler('DELETE', 'please/delete/me');
        expect(handler).toBeTruthy();
        // Check registration of handlers with route parameters
        service.register('please/:get/me', null, 'GET');
        handler = service.findRequestHandler('GET', 'please/join/me');
        expect(handler).toBeTruthy();
    });

    it('should handle route parameters', done => {
        expect.assertions(3);
        service.register('please/:get/me', null);
        const handler = service.findRequestHandler('GET', 'please/join/me');
        expect(handler).toBeTruthy();
        expect((handler || ({} as any)).path_structure).toEqual(['', 'get', '']);
        service.register('please/:get/me', null, 'GET', request => {
            expect(request.route_params).toEqual({ get: 'help' });
            done();
        });
        service.get('please/help/me?query=true').subscribe(_ => null);
        jest.runOnlyPendingTimers();
    });

    it('should handle query parameters', done => {
        expect.assertions(1);
        service.register('please/:get/me', null, 'GET', request => {
            expect(request.query_params).toEqual({ query: 'true' });
            done();
        });
        service.get('please/help/me?query=true').subscribe(_ => null);
        jest.runOnlyPendingTimers();
    });

    describe('GET', () => {
        it('should register new GET handlers', done => {
            expect.assertions(2);
            service.register(':get/him', null, 'GET', request => {
                expect(request).toBeTruthy();
                done();
            });
            const handler = service.findRequestHandler('GET', 'join/him');
            expect(handler).toBeTruthy();
            service.get('lob/him?query=true').subscribe(_ => null);
            jest.runOnlyPendingTimers();
        });

        it('should call GET request if there is no handler', () => {
            const spy = jest.spyOn(engine_http.ajax, 'get');
            spy.mockImplementation(() => of({}));
            service.get('write/doc/name').subscribe(_ => null);
            expect(engine_http.ajax.get).toBeCalled();
            spy.mockReset();
            service.register('write/doc/:get', null, 'GET');
            service.get('write/doc/name').subscribe(_ => null);
            expect(engine_http.ajax.get).not.toBeCalled();
            spy.mockRestore();
        });
    });

    describe('POST', () => {
        it('should register new POST handlers', done => {
            expect.assertions(2);
            service.register(':get/him', {}, 'POST', request => {
                expect(request).toBeTruthy();
                done();
            });
            const handler = service.findRequestHandler('POST', 'join/him');
            expect(handler).toBeTruthy();
            service.post('lob/him?query=true', {}).subscribe(_ => null, err => null);
            jest.runOnlyPendingTimers();
        });

        it('should call POST request if there is no handler', () => {
            const spy = jest.spyOn(engine_http.ajax, 'post');
            spy.mockImplementation(() => of('{}'));
            service.post('write/doc/name', {}).subscribe(_ => null);
            expect(engine_http.ajax.post).toBeCalled();
            spy.mockReset();
            service.register('write/doc/:get', {}, 'POST');
            service.post('write/doc/name', {}).subscribe(_ => null);
            expect(engine_http.ajax.post).not.toBeCalled();
            spy.mockRestore();
        });
    });

    describe('PUT', () => {
        it('should register new PUT handlers', done => {
            expect.assertions(2);
            service.register(':get/him', {}, 'PUT', request => {
                expect(request).toBeTruthy();
                done();
            });
            const handler = service.findRequestHandler('PUT', 'join/him');
            expect(handler).toBeTruthy();
            service.put('lob/him?query=true', {}).subscribe(_ => null, err => null);
            jest.runOnlyPendingTimers();
        });

        it('should call PUT request if there is no handler', () => {
            const spy = jest.spyOn(engine_http.ajax, 'put');
            spy.mockImplementation(() => of('{}'));
            service.put('write/doc/name', {}).subscribe(_ => null);
            expect(engine_http.ajax.put).toBeCalled();
            spy.mockReset();
            service.register('write/doc/:get', {}, 'PUT');
            service.put('write/doc/name', {}).subscribe(_ => null);
            expect(engine_http.ajax.put).not.toBeCalled();
            spy.mockRestore();
        });
    });

    describe('PATCH', () => {
        it('should register new PATCH handlers', done => {
            expect.assertions(2);
            service.register(':get/him', {}, 'PATCH', request => {
                expect(request).toBeTruthy();
                done();
            });
            const handler = service.findRequestHandler('PATCH', 'join/him');
            expect(handler).toBeTruthy();
            service.patch('lob/him?query=true', {}).subscribe(_ => null, _ => null);
            jest.runOnlyPendingTimers();
        });

        it('should call PATCH request if there is no handler', () => {
            const spy = jest.spyOn(engine_http.ajax, 'patch');
            spy.mockImplementation(() => of('{}'));
            service.patch('write/doc/name', {}).subscribe(_ => null);
            expect(engine_http.ajax.patch).toBeCalled();
            spy.mockReset();
            service.register('write/doc/:get', {}, 'PATCH');
            service.patch('write/doc/name', {}).subscribe(_ => null);
            expect(engine_http.ajax.patch).not.toBeCalled();
            spy.mockRestore();
        });
    });

    describe('DELETE', () => {
        it('should register new DELETE handlers', done => {
            expect.assertions(2);
            service.register(':get/him', null, 'DELETE', request => {
                expect(request).toBeTruthy();
                done();
            });
            const handler = service.findRequestHandler('DELETE', 'join/him');
            expect(handler).toBeTruthy();
            service.delete('lob/him?query=true').subscribe(_ => null);
            jest.runOnlyPendingTimers();
        });

        it('should call DELETE request if there is no handler', () => {
            const spy = jest.spyOn(engine_http.ajax, 'delete');
            spy.mockImplementation(() => of({}));
            service.delete('write/doc/name').subscribe(_ => null);
            expect(engine_http.ajax.delete).toBeCalled();
            spy.mockReset();
            service.register('write/doc/:get', null, 'DELETE');
            service.delete('write/doc/name').subscribe(_ => null);
            expect(engine_http.ajax.delete).not.toBeCalled();
            spy.mockRestore();
        });
    });
});
