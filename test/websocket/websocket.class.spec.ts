import { Subject } from 'rxjs';

import { engine, EngineWebsocket } from '../../src/websocket/webocket.class';
import { EngineResponse } from '../../src/websocket/websocket.interfaces';

describe('EngineWebsocket', () => {
    let websocket: EngineWebsocket;
    let fake_socket: Subject<any>;

    beforeEach(() => {
        fake_socket = new Subject<any>();
        spyOn(engine, 'websocket').and.returnValue(fake_socket);
        spyOn(engine, 'log');
        websocket = new EngineWebsocket({
            token: 'test',
            host: 'aca.test',
            fixed: true,
        });
    });

    it('should create an instance', () => {
        expect(websocket).toBeTruthy();
    })

    it('should connect to the websocket', () => {
        expect(engine.websocket).toBeCalledWith(
            `ws://aca.test/control/websocket?bearer=test&fixed_device=true`,
        );
    });

    it('should handle bind request', (done) => {
        let promise = websocket.bind({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' });
        expect(promise).toBeInstanceOf(Promise);
        // Test success
        promise.then(() => {
            promise = websocket.bind({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' });
            expect(promise).toBeInstanceOf(Promise);
            // Test error
            promise.then(null, () => done());
            fake_socket.next({ id: 2, type: 'error', code: 7, msg: 'test error' } as EngineResponse);
        });
        fake_socket.next({ id: 1, type: 'success' } as EngineResponse);
    });

    it('should handle unbind request', (done) => {
        let promise = websocket.unbind({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' });
        expect(promise).toBeInstanceOf(Promise);
        // Test success
        promise.then(() => {
            promise = websocket.unbind({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' });
            expect(promise).toBeInstanceOf(Promise);
            // Test error
            promise.then(null, () => done());
            fake_socket.next({ id: 2, type: 'error', code: 7, msg: 'test error' } as EngineResponse);
        });
        fake_socket.next({ id: 1, type: 'success' } as EngineResponse);
    });

    it('should handle exec request', (done) => {
        let promise = websocket.exec({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power', args: ['test'] });
        expect(promise).toBeInstanceOf(Promise);
        // Test success
        promise.then((value) => {
            expect(value).toBe('test');
            promise = websocket.exec({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power', args: ['test'] });
            expect(promise).toBeInstanceOf(Promise);
            // Test error
            promise.then(null, () => done());
            fake_socket.next({ id: 2, type: 'error', code: 7, msg: 'test error' } as EngineResponse);
        });
        fake_socket.next({ id: 1, type: 'success', value: 'test' } as EngineResponse);
    });

    it('should handle debug request', (done) => {
        let promise = websocket.debug({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' });
        expect(promise).toBeInstanceOf(Promise);
        // Test success
        promise.then(() => {
            fake_socket.next({ type: 'debug', mod: 'test', klass: '::klass', msg: 'test debug' } as EngineResponse);
            setTimeout(() => {
                expect(engine.log).toBeCalledWith('WS', `[Debug] test::klass →`, 'test debug');
                done();
            });
        });
        fake_socket.next({ id: 1, type: 'success', value: 'test' } as EngineResponse);
    });

    it('should handle ignore request', (done) => {
        let promise = websocket.ignore({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' });
        expect(promise).toBeInstanceOf(Promise);
        // Test success
        promise.then(() => {
            promise = websocket.ignore({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' });
            expect(promise).toBeInstanceOf(Promise);
            // Test error
            promise.then(null, () => done());
            fake_socket.next({ id: 2, type: 'error', code: 7, msg: 'test error' } as EngineResponse);
        });
        fake_socket.next({ id: 1, type: 'success', value: 'test' } as EngineResponse);
    });

    it('should handle notify responses', (done) => {
        const binding = { sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' };
        let promise = websocket.bind(binding);
        expect(promise).toBeInstanceOf(Promise);
        // Test success
        promise.then(() => {
            websocket.listen(binding, (value) => {
                if (value) {
                    expect(value).toBe('Yeah')
                    done();
                }
            });
            fake_socket.next({ type: 'notify', value: 'Yeah', meta: binding } as EngineResponse);
        });
        fake_socket.next({ id: 1, type: 'success' } as EngineResponse);
    });
});
