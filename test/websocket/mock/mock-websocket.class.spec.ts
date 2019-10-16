import { Subject } from 'rxjs';

import {
    engine_mock_socket,
    MockEngineWebsocket
} from '../../../src/websocket/mock/mock-websocket.class';

describe('MockEngineWebsocket', () => {
    let websocket: MockEngineWebsocket;
    let fake_socket: Subject<any>;
    let auth: any;

    beforeEach(() => {
        jest.useFakeTimers();
        fake_socket = new Subject<any>();
        // spy = spyOn(engine_mock_socket, 'websocket').and.returnValue(fake_socket);
        window.control = {
            systems: {
                'sys-A0': {
                    Test: [
                        {
                            test: 10,
                            $testCall() {
                                return (this as any)._system.Test[0].test++;
                            }
                        }
                    ]
                }
            }
        } as any;
        auth = { token: 'test', refreshAuthority: () => null };
        spyOn(engine_mock_socket, 'log');
        websocket = new MockEngineWebsocket(auth, {
            host: 'aca.test',
            fixed: true
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should create an instance', () => {
        expect(websocket).toBeTruthy();
    });

    it('should bind to mock system modules', done => {
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'test' };
        const promise = websocket.bind(binding);
        promise.then(() => {
            expect(websocket.value(binding)).toBe(10);
            done();
        });
        jest.runOnlyPendingTimers();
    });

    it('post binding value updates', done => {
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'test' };
        let count = 0;
        const sub = websocket.listen(binding, value => {
            if (count === 0) {
                expect(value).toBeNull();
                count++;
            } else {
                expect(value).toBe(10);
                done();
            }
        });
        websocket.bind(binding);
        jest.runOnlyPendingTimers();
    });

    it('should unbind from mock system modules', done => {
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'test' };
        let promise = websocket.bind(binding);
        promise.then(() => {
            expect(websocket.value(binding)).toBe(10);
            promise = websocket.unbind(binding);
            promise.then(() => {
                window.control.systems['sys-A0'].Test[0].test = 20;
                jest.runOnlyPendingTimers();
                expect(websocket.value).not.toBe(20);
                done();
            });
            jest.runOnlyPendingTimers();
        });
        jest.runOnlyPendingTimers();
    });

    it('should exec mock system module methods', done => {
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'testCall' };
        websocket.bind({ ...binding, name: 'test' });
        const promise = websocket.exec(binding);
        promise.then(value => {
            expect(value).toBe(10);
            jest.runOnlyPendingTimers();
            expect(websocket.value({ ...binding, name: 'test' })).toBe(11);
            done();
        });
        jest.runOnlyPendingTimers();
    });

    it('should error if binding module not found', done => {
        const binding = { sys: 'sys-A0', mod: 'Testing', index: 1, name: 'test' };
        const promise = websocket.bind(binding);
        promise.then(null, () => {
            done();
        });
        jest.runOnlyPendingTimers();
    });

    it('should error if binding system not found', done => {
        const binding = { sys: 'sys-B0', mod: 'Test', index: 1, name: 'test' };
        const promise = websocket.bind(binding);
        promise.then(null, () => {
            done();
        });
        jest.runOnlyPendingTimers();
    });

    it('should error if binding system not found', done => {
        const binding = { sys: 'sys-B0', mod: 'Test', index: 1, name: 'test' };
        const promise = websocket.bind(binding);
        promise.then(null, () => {
            done();
        });
        jest.runOnlyPendingTimers();
    });

    it('update token should do nothing', () => {
        auth.token = '';
        expect(websocket.is_connected).toBe(true);
        jest.runOnlyPendingTimers();
        expect(websocket.is_connected).toBe(true);
    });
});
