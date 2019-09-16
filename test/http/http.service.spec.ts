import { EngineHttpClient, engine_http } from '../../src/http/http.service';
import { of, throwError } from 'rxjs';

describe('EngineHttpClient', () => {
    let spy: any;
    let auth: any;
    let service: EngineHttpClient;

    beforeEach(() => {
        auth = { has_token: false, token: 'test_token' };
        auth.refreshAuthority = jest.fn();
        service = new EngineHttpClient(auth);
    });

    it('should create an instance', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(EngineHttpClient);
    });

    it('should refresh auth on 401 errors on GET and DELETE requests', done => {
        expect.assertions(2);
        spy = jest.spyOn(engine_http.ajax, 'get');
        spy.mockImplementation(() => throwError({ status: 400, message: 'Bad Request' }));
        auth.has_token = true;
        service.get('_').subscribe(_ => null, _ => null);
        expect(auth.refreshAuthority).not.toBeCalled();
        spy.mockImplementation(() => throwError({ status: 401, message: 'Unauthorised' }));
        service.get('_').subscribe(_ => null, _ => setTimeout(() => done()));
        expect(auth.refreshAuthority).toBeCalled();
        spy.mockReset();
        spy.mockRestore();
    });

    describe('GET', () => {
        beforeEach(() => {
            auth.has_token = false;
            spy = jest.spyOn(engine_http.ajax, 'get');
            spy.mockImplementation(() =>
                of({
                    status: 200,
                    responseText: JSON.stringify({ message: 'GET RECEIVED!!!' })
                } as any)
            );
            jest.useFakeTimers();
        });

        afterEach(() => {
            spy.mockReset();
            spy.mockRestore();
            jest.useRealTimers();
        });

        it('should allow requests', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.get('test_url').subscribe(data => {
                expect(data).toEqual({ message: 'GET RECEIVED!!!' });
                done();
            });
            expect(engine_http.ajax.get).toBeCalledWith('test_url', {
                Authorization: 'test_token'
            });
        });

        it('should prevent requests until auth is loaded', () => {
            expect.assertions(2);
            service.get('test_url').subscribe(_ => null);
            expect(engine_http.ajax.get).not.toBeCalled();
            auth.has_token = true;
            jest.runOnlyPendingTimers();
            expect(engine_http.ajax.get).toBeCalledWith('test_url', {
                Authorization: 'test_token'
            });
        });

        it('should allow returning text data', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.get('test_url', { response_type: 'text' }).subscribe(data => {
                expect(data).toBe(JSON.stringify({ message: 'GET RECEIVED!!!' }));
                done();
            });
            expect(engine_http.ajax.get).toBeCalledWith('test_url', {
                Authorization: 'test_token'
            });
        });

        it('should allow custom headers', () => {
            expect.assertions(1);
            auth.has_token = true;
            service
                .get('test_url', { headers: { 'CUSTOM-HEADER-X': 'Trump Cards :)' } })
                .subscribe(_ => null);
            expect(engine_http.ajax.get).toBeCalledWith('test_url', {
                Authorization: 'test_token',
                'CUSTOM-HEADER-X': 'Trump Cards :)'
            });
        });

        it('should handle errors', done => {
            expect.assertions(1);
            spy.mockImplementation(() => throwError({ status: 400, message: 'Bad Request' }));
            service.get('_').subscribe(
                _ => null,
                err => {
                    expect(err).toEqual({ status: 400, message: 'Bad Request' });
                    done();
                }
            );
            auth.has_token = true;
            jest.runOnlyPendingTimers();
        });
    });

    describe('POST', () => {
        beforeEach(() => {
            auth.has_token = false;
            spy = jest.spyOn(engine_http.ajax, 'post');
            spy.mockImplementation(() =>
                of({
                    status: 200,
                    responseText: JSON.stringify({ message: 'POST RECEIVED!!!' })
                } as any)
            );
            jest.useFakeTimers();
        });

        afterEach(() => {
            spy.mockReset();
            spy.mockRestore();
            jest.useRealTimers();
        });

        it('should allow requests', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.post('test_url', 'test_body').subscribe(data => {
                expect(data).toEqual({ message: 'POST RECEIVED!!!' });
                done();
            });
            expect(engine_http.ajax.post).toBeCalledWith('test_url', 'test_body', {
                Authorization: 'test_token'
            });
        });

        it('should prevent requests until auth is loaded', () => {
            expect.assertions(2);
            service.post('test_url', 'test_body').subscribe(_ => null);
            expect(engine_http.ajax.post).not.toBeCalled();
            auth.has_token = true;
            jest.runOnlyPendingTimers();
            expect(engine_http.ajax.post).toBeCalledWith('test_url', 'test_body', {
                Authorization: 'test_token'
            });
        });

        it('should allow returning text data', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.post('test_url', 'test_body', { response_type: 'text' }).subscribe(data => {
                expect(data).toBe(JSON.stringify({ message: 'POST RECEIVED!!!' }));
                done();
            });
            expect(engine_http.ajax.post).toBeCalledWith('test_url', 'test_body', {
                Authorization: 'test_token'
            });
        });

        it('should allow custom headers', () => {
            expect.assertions(1);
            auth.has_token = true;
            service
                .post('test_url', 'test_body', { headers: { 'CUSTOM-HEADER-X': 'Trump Cards :)' } })
                .subscribe(_ => null);
            expect(engine_http.ajax.post).toBeCalledWith('test_url', 'test_body', {
                Authorization: 'test_token',
                'CUSTOM-HEADER-X': 'Trump Cards :)'
            });
        });

        it('should handle errors', done => {
            expect.assertions(1);
            spy.mockImplementation(() => throwError({ status: 400, message: 'Bad Request' }));
            service.post('_', '').subscribe(
                _ => null,
                err => {
                    expect(err).toEqual({ status: 400, message: 'Bad Request' });
                    done();
                }
            );
            auth.has_token = true;
            jest.runOnlyPendingTimers();
        });
    });

    describe('PUT', () => {
        beforeEach(() => {
            auth.has_token = false;
            spy = jest.spyOn(engine_http.ajax, 'put');
            spy.mockImplementation(() =>
                of({
                    status: 200,
                    responseText: JSON.stringify({ message: 'PUT RECEIVED!!!' })
                } as any)
            );
            jest.useFakeTimers();
        });

        afterEach(() => {
            spy.mockReset();
            spy.mockRestore();
            jest.useRealTimers();
        });

        it('should allow requests', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.put('test_url', 'test_body').subscribe(data => {
                expect(data).toEqual({ message: 'PUT RECEIVED!!!' });
                done();
            });
            expect(engine_http.ajax.put).toBeCalledWith('test_url', 'test_body', {
                Authorization: 'test_token'
            });
        });

        it('should prevent requests until auth is loaded', () => {
            expect.assertions(2);
            service.put('test_url', { test: 'body' }).subscribe(_ => null);
            expect(engine_http.ajax.put).not.toBeCalled();
            auth.has_token = true;
            jest.runOnlyPendingTimers();
            expect(engine_http.ajax.put).toBeCalledWith(
                'test_url',
                { test: 'body' },
                { Authorization: 'test_token' }
            );
        });

        it('should handle errors', done => {
            expect.assertions(1);
            spy.mockImplementation(() => throwError({ status: 400, message: 'Bad Request' }));
            service.put('_', '').subscribe(
                _ => null,
                err => {
                    expect(err).toEqual({ status: 400, message: 'Bad Request' });
                    done();
                }
            );
            auth.has_token = true;
            jest.runOnlyPendingTimers();
        });
    });

    describe('PATCH', () => {
        beforeEach(() => {
            auth.has_token = false;
            spy = jest.spyOn(engine_http.ajax, 'patch');
            spy.mockImplementation(() =>
                of({
                    status: 200,
                    responseText: JSON.stringify({ message: 'PATCH RECEIVED!!!' })
                } as any)
            );
            jest.useFakeTimers();
        });

        afterEach(() => {
            spy.mockReset();
            spy.mockRestore();
            jest.useRealTimers();
        });

        it('should allow requests', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.patch('test_url', 'test_body').subscribe(data => {
                expect(data).toEqual({ message: 'PATCH RECEIVED!!!' });
                done();
            });
            expect(engine_http.ajax.patch).toBeCalledWith('test_url', 'test_body', {
                Authorization: 'test_token'
            });
        });

        it('should prevent requests until auth is loaded', () => {
            expect.assertions(2);
            service.patch('test_url', { test: 'body' }).subscribe(_ => null);
            expect(engine_http.ajax.patch).not.toBeCalled();
            auth.has_token = true;
            jest.runOnlyPendingTimers();
            expect(engine_http.ajax.patch).toBeCalledWith(
                'test_url',
                { test: 'body' },
                { Authorization: 'test_token' }
            );
        });

        it('should handle errors', done => {
            expect.assertions(1);
            spy.mockImplementation(() => throwError({ status: 400, message: 'Bad Request' }));
            service.patch('_', '').subscribe(
                _ => null,
                err => {
                    expect(err).toEqual({ status: 400, message: 'Bad Request' });
                    done();
                }
            );
            auth.has_token = true;
            jest.runOnlyPendingTimers();
        });
    });

    describe('DELETE', () => {
        beforeEach(() => {
            auth.has_token = false;
            spy = jest.spyOn(engine_http.ajax, 'delete');
            spy.mockImplementation(() =>
                of({
                    status: 200,
                    responseText: JSON.stringify({ message: 'DELETE RECEIVED!!!' })
                } as any)
            );
            jest.useFakeTimers();
        });

        afterEach(() => {
            spy.mockReset();
            spy.mockRestore();
            jest.useRealTimers();
        });

        it('should allow requests', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.delete('test_url').subscribe(data => {
                expect(data).toBeUndefined();
                done();
            });
            expect(engine_http.ajax.delete).toBeCalledWith('test_url', {
                Authorization: 'test_token'
            });
        });

        it('should prevent requests until auth is loaded', () => {
            expect.assertions(2);
            service.delete('test_url').subscribe(_ => null);
            expect(engine_http.ajax.delete).not.toBeCalled();
            auth.has_token = true;
            jest.runOnlyPendingTimers();
            expect(engine_http.ajax.delete).toBeCalledWith('test_url', {
                Authorization: 'test_token'
            });
        });

        it('should allow returning json data', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.delete('test_url', { response_type: 'json' }).subscribe(data => {
                expect(data).toEqual({ message: 'DELETE RECEIVED!!!' });
                done();
            });
            expect(engine_http.ajax.delete).toBeCalledWith('test_url', {
                Authorization: 'test_token'
            });
        });

        it('should allow returning text data', done => {
            auth.has_token = true;
            expect.assertions(2);
            service.delete('test_url', { response_type: 'text' }).subscribe(data => {
                expect(data).toBe(JSON.stringify({ message: 'DELETE RECEIVED!!!' }));
                done();
            });
            expect(engine_http.ajax.delete).toBeCalledWith('test_url', {
                Authorization: 'test_token'
            });
        });

        it('should handle errors', done => {
            expect.assertions(1);
            spy.mockImplementation(() => throwError({ status: 400, message: 'Bad Request' }));
            service.delete('_').subscribe(
                _ => null,
                err => {
                    expect(err).toEqual({ status: 400, message: 'Bad Request' });
                    done();
                }
            );
            auth.has_token = true;
            jest.runOnlyPendingTimers();
        });
    });
});
