
import { MockEngineWebsocketModule } from '../../../src/websocket/mock/mock-engine-module.class';

describe('MockEngineWebsocketModule', () => {
    let module: MockEngineWebsocketModule;
    const system = {
        Bookings: [{
            test: 10,
            $namespaceTest: 99,
            namespaceTestFn: () => 1,
            $method: () => 10,
            $methodWithOneArg: (arg1: number) => arg1 + 1,
            $methodWithTwoArgs: (arg1: number, arg2: number) => arg1 + arg2,
            $updateOtherModule: function () {
                return (this as any)._system.Other[0].test--;
            }
        }],
        Other: [{
            test: 20
        }]
    };

    beforeEach(() => {
        module = new MockEngineWebsocketModule(system as any, system.Bookings[0])
    });

    it('should create an instance', () => {
        expect(module).toBeTruthy();
    });

    it('should allow getting binding values', () => {
        expect(module.test).toBe(10);
    });

    it('should allow setting binding values', () => {
        expect(module.test).toBe(10);
        module.test = 20;
        expect(module.test).toBe(20);
    });

    it('should allow listening to binding values', (done) => {
        let test_count = 0;
        module.listen('test', (value: any) => {
            if (test_count === 0) {
                expect(value).toBe(10);
                test_count++;
            } else if (test_count === 1) {
                expect(value).toBe(20);
                done();
            }
        });
        setTimeout(() => module.test = 20);
    });

    it('should allow listening to non-predefined binding values', (done) => {
        let test_count = 0;
        module.listen('other_test', (value: any) => {
            if (test_count === 0) {
                expect(value).toBe(null);
                test_count++;
            } else if (test_count === 1) {
                expect(value).toBe(20);
                done();
            }
        });
        setTimeout(() => module.other_test = 20);
    })

    it('should allow for executing methods', () => {
        expect(module.call('method')).toBe(10);
        expect(module.call('methodWithOneArg', [10])).toBe(11);
        expect(module.call('methodWithTwoArgs', [10, 11])).toBe(21);
        expect(module.call('falseFn')).toBe(null);
    });

    it('should remove namespace from value bindings', () => {
        expect(module.namespaceTest).toBe(99);
    });

    it('should namespace executable methods', () => {
        expect(module.namespaceTestFn).toBeUndefined();
        expect(module.call('namespaceTestFn')).toBe(1);
    });

    it('should allow for access to parent system', () => {
        expect(module.call('updateOtherModule')).toBe(20);
        expect(system.Other[0].test).toBe(19);
    });
});
