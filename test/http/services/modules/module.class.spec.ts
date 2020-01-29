import { ACAEngine } from '../../../../src/acaengine';
import { EngineDriverRole } from '../../../../src/http/services/drivers/drivers.enums';
import { EngineModule } from '../../../../src/http/services/modules/module.class';
import { EngineSettings } from '../../../../src/http/services/settings/settings.class';

describe('EngineModule', () => {
    let module: EngineModule;
    let service: any;
    const features: string[] = ['test', 'device', 'here'];
    const modules: string[] = ['test', 'device', 'here'];
    const zones: string[] = ['test', 'device', 'here'];

    beforeEach(() => {
        service = {
            start: jest.fn(),
            stop: jest.fn(),
            types: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            ping: jest.fn(),
            state: jest.fn(),
            internalState: jest.fn()
        };
        jest.spyOn(ACAEngine, 'systems', 'get').mockReturnValue(null as any);
        jest.spyOn(ACAEngine, 'drivers', 'get').mockReturnValue(null as any);
        module = new EngineModule(service, {
            id: 'mod_test',
            dependency_id: 'dep-001',
            control_system_id: 'sys-001',
            ip: '1.1.1.1',
            tls: false,
            udp: false,
            port: 32000,
            makebreak: false,
            uri: 'test.com',
            custom_name: 'mi-name',
            settings: { settings_string: '{ star: \'death\' }' },
            role: EngineDriverRole.Device,
            notes: 'Clone wars',
            ignore_connected: false,
            control_system: { id: 'sys-001', name: 'A System' },
            driver: { id: 'dep-001', name: 'A Driver' }
        });
        (ACAEngine as any)._initialised.next(true);
    });

    it('should create instance', () => {
        expect(module).toBeTruthy();
        expect(module).toBeInstanceOf(EngineModule);
    });

    it('should expose dependency id', () => {
        expect(module.dependency_id).toBe('dep-001');
    });

    it('should allow setting dependency id on new modules', () => {
        try {
            module.storePendingChange('dependency_id', 'new-dep-test');
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.storePendingChange('dependency_id', 'another-dep');
        expect(new_mod.dependency_id).not.toBe('another-dep');
        expect(new_mod.changes.dependency_id).toBe('another-dep');
    });

    it('should expose system id', () => {
        expect(module.control_system_id).toBe('sys-001');
        expect(module.system_id).toBe('sys-001');
    });

    it('should allow setting system id on new modules', () => {
        try {
            module.storePendingChange('control_system_id', 'new-sys-test');
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.storePendingChange('control_system_id', 'another-sys');
        expect(new_mod.control_system_id).not.toBe('another-sys');
        expect(new_mod.changes.control_system_id).toBe('another-sys');
    });

    it('should expose ip address', () => {
        expect(module.ip).toBe('1.1.1.1');
    });

    it('should allow setting ip address on new modules', () => {
        module.storePendingChange('ip', '1.0.0.1');
        expect(module.ip).not.toBe('1.0.0.1');
        expect(module.changes.ip).toBe('1.0.0.1');
    });

    it('should expose TLS', () => {
        expect(module.tls).toBe(false);
    });

    it('should allow setting TLS on new modules', () => {
        module.storePendingChange('tls', true);
        expect(module.tls).not.toBe(true);
        expect(module.changes.tls).toBe(true);
    });

    it('should expose UDP', () => {
        expect(module.udp).toBe(false);
    });

    it('should allow setting UDP on new modules', () => {
        module.storePendingChange('udp', true);
        expect(module.udp).not.toBe(true);
        expect(module.changes.udp).toBe(true);
    });

    it('should expose port number', () => {
        expect(module.port).toBe(32000);
    });

    it('should allow setting port number on new modules', () => {
        module.storePendingChange('port', 32023);
        expect(module.port).not.toBe(32023);
        expect(module.changes.port).toBe(32023);
    });

    it('should expose makebreak', () => {
        expect(module.makebreak).toBe(false);
    });

    it('should allow setting port number on new modules', () => {
        module.storePendingChange('makebreak', true);
        expect(module.makebreak).not.toBe(true);
        expect(module.changes.makebreak).toBe(true);
    });

    it('should expose uri', () => {
        expect(module.uri).toBe('test.com');
    });

    it('should allow setting port number on new modules', () => {
        module.storePendingChange('uri', 'o.bi.wan');
        expect(module.uri).not.toBe('o.bi.wan');
        expect(module.changes.uri).toBe('o.bi.wan');
    });

    it('should expose custom name', () => {
        expect(module.custom_name).toBe('mi-name');
    });

    it('should allow setting custom name', () => {
        module.storePendingChange('custom_name', 'Crystal');
        expect(module.custom_name).not.toBe('Crystal');
        expect(module.changes.custom_name).toBe('Crystal');
    });

    it('should expose settings', () => {
        expect(module.settings).toBeInstanceOf(EngineSettings);
    });

    it('should expose role', () => {
        expect(module.role).toBe(EngineDriverRole.Device);
    });

    it('should allow setting role on new modules', () => {
        try {
            module.storePendingChange('role', EngineDriverRole.SSH);
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.storePendingChange('role', EngineDriverRole.Service);
        expect(new_mod.role).not.toBe(EngineDriverRole.Service);
        expect(new_mod.changes.role).toBe(EngineDriverRole.Service);
    });

    it('should expose notes', () => {
        expect(module.notes).toEqual('Clone wars');
    });

    it('should allow updating module notes', () => {
        const new_notes = 'Phantom menance';
        module.storePendingChange('notes', 'Phantom menance');
        expect(module.notes).not.toBe(new_notes);
        expect(module.changes.notes).toBe(new_notes);
    });

    it('should expose ignore connected', () => {
        expect(module.ignore_connected).toBe(false);
    });

    it('should allow setting ignore connected on new modules', () => {
        module.storePendingChange('ignore_connected', true);
        expect(module.ignore_connected).not.toBe(true);
        expect(module.changes.ignore_connected).toBe(true);
    });

    it('should allow starting the module', async () => {
        service.start.mockReturnValue(Promise.resolve());
        await module.start();
        expect(service.start).toBeCalledWith('mod_test');
        const new_mod = new EngineModule(service, {});
        try {
            new_mod.start();
            throw new Error('Failed to error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to error'));
        }
    });

    it('should allow stopping the module', async () => {
        service.stop.mockReturnValue(Promise.resolve());
        await module.stop();
        expect(service.stop).toBeCalledWith('mod_test');
        const new_mod = new EngineModule(service, {});
        try {
            new_mod.stop();
            throw new Error('Failed to error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to error'));
        }
    });

    it('should allow pinging the module', async () => {
        service.ping.mockReturnValue(Promise.resolve({}));
        const response = await module.ping();
        expect(service.ping).toBeCalledWith('mod_test');
        expect(response).toEqual({});
        const new_mod = new EngineModule(service, {});
        try {
            new_mod.ping();
            throw new Error('Failed to error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to error'));
        }
    });

    it('should allow getting state of the module', async () => {
        service.state.mockReturnValue(Promise.resolve({}));
        let response = await module.state();
        expect(service.state).toBeCalledWith('mod_test', undefined);
        expect(response).toEqual({});
        response = await module.state('lookup_value');
        expect(service.state).toBeCalledWith('mod_test', 'lookup_value');
        const new_mod = new EngineModule(service, {});
        try {
            new_mod.state();
            throw new Error('Failed to error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to error'));
        }
    });

    it('should allow getting internal state of the module', async () => {
        service.internalState.mockReturnValue(Promise.resolve({}));
        const response = await module.internalState();
        expect(service.internalState).toBeCalledWith('mod_test');
        expect(response).toEqual({});
        const new_mod = new EngineModule(service, {});
        try {
            new_mod.internalState();
            throw new Error('Failed to error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to error'));
        }
    });
});
