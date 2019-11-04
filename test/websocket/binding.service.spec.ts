import { EngineBindingService } from '../../src/websocket/binding.service';
import { EngineModuleBinding } from '../../src/websocket/classes/engine-module.class';
import { EngineSystemBinding } from '../../src/websocket/classes/engine-system.class';

describe('EngineBindingService', () => {
    let service: EngineBindingService;
    let fake_websocket: any;

    beforeEach(() => {
        jest.useFakeTimers();
        fake_websocket = { exec: (_: any) => null };
        spyOn(fake_websocket, 'exec').and.returnValue(Promise.resolve(10));
        service = new EngineBindingService(fake_websocket);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should create an instance', () => {
        expect(service).toBeTruthy();
    });

    it('should expose the websocket', () => {
        expect(service.engine).toBe(fake_websocket);
    });

    it('should allow getting systems', () => {
        const system = service.system('sys-A0');
        expect(system).toBeInstanceOf(EngineSystemBinding);
        expect(system.id).toBe('sys-A0');
    });

    it('should allow getting modules', () => {
        const module = service.module('sys-A0', 'Test');
        expect(module).toBeInstanceOf(EngineModuleBinding);
        expect(module.id).toBe('Test_1');
        expect(module.name).toBe('Test');
        expect(module.index).toBe(1);
        expect(service.module('sys-A0', 'Test', 1)).toBe(module);
        expect(service.module('sys-A0', 'Test_1')).toBe(module);
    });

    it('should allow user to execute methods on modules', () => {
        const binding = { sys: 'sys-A0', mod: 'mod-test', index: 1, name: 'test', args: [1, 2] };
        const promise = service.exec(binding);
        expect(promise).toBeInstanceOf(Promise);
        expect(fake_websocket.exec).toBeCalledWith(binding);
    });
});
