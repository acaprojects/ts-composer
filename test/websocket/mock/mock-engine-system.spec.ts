import { MockEngineWebsocketSystem } from "../../../src/websocket/mock/mock-engine-system.class";
import { MockEngineWebsocketModule } from "../../../src/websocket/mock/mock-engine-module.class";

describe('MockEngineWebsocketSystem', () => {
    let system: MockEngineWebsocketSystem;

    beforeEach(() => {
        const system_metadata = {
            Bookings: [{
                test: 10,
                $method: () => 10,
                $methodWithOneArg: (arg1: number) => arg1 + 1,
                $methodWithTwoArgs: (arg1: number, arg2: number) => arg1 + arg2
            }],
            Other: [{
                test: 20
            },{
                test: 11
            }]
        };
        system = new MockEngineWebsocketSystem(system_metadata);
    });

    it('should create an instance', () => {
        expect(system).toBeTruthy();
    });

    it('should expose the modules', () => {
        expect(system.Bookings[0]).toBeInstanceOf(MockEngineWebsocketModule);
        expect(system.Other[0]).toBeInstanceOf(MockEngineWebsocketModule);
        expect(system.Other[1]).toBeInstanceOf(MockEngineWebsocketModule);
    });
});
