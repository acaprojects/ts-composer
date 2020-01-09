import { Composer } from '../../../../src/composer';
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
        module = new EngineModule(service, {
            id: 'mod_test',
            dependency_id: 'dep-001',
            control_system_id: 'sys-001',
            edge_id: 'edge-test',
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
            ignore_connected: false
        });
        (Composer as any)._initialised.next(true);
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
            module.dependency_id = 'new-dep-test';
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.dependency_id = 'another-dep';
        expect(new_mod.dependency_id).not.toBe('another-dep');
        expect(new_mod.changes.dependency_id).toBe('another-dep');
    });

    it('should expose system id', () => {
        expect(module.system_id).toBe('sys-001');
    });

    it('should allow setting system id on new modules', () => {
        try {
            module.system_id = 'new-sys-test';
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.system_id = 'another-sys';
        expect(new_mod.system_id).not.toBe('another-sys');
        expect(new_mod.changes.control_system_id).toBe('another-sys');
    });

    it('should expose edge id', () => {
        expect(module.edge_id).toBe('edge-test');
    });

    it('should allow setting edge id on new modules', () => {
        try {
            module.edge_id = 'new-edge-test';
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.edge_id = 'another-edge';
        expect(new_mod.edge_id).not.toBe('another-edge');
        expect(new_mod.changes.edge_id).toBe('another-edge');
    });

    it('should expose ip address', () => {
        expect(module.ip).toBe('1.1.1.1');
    });

    it('should allow setting ip address on new modules', () => {
        try {
            module.ip = '8.8.8.8';
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.ip = '1.0.0.1';
        expect(new_mod.ip).not.toBe('1.0.0.1');
        expect(new_mod.changes.ip).toBe('1.0.0.1');
    });

    it('should expose TLS', () => {
        expect(module.tls).toBe(false);
    });

    it('should allow setting TLS on new modules', () => {
        try {
            module.tls = true;
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.tls = true;
        expect(new_mod.tls).not.toBe(true);
        expect(new_mod.changes.tls).toBe(true);
    });

    it('should expose UDP', () => {
        expect(module.udp).toBe(false);
    });

    it('should allow setting UDP on new modules', () => {
        try {
            module.udp = true;
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.udp = true;
        expect(new_mod.udp).not.toBe(true);
        expect(new_mod.changes.udp).toBe(true);
    });

    it('should expose port number', () => {
        expect(module.port).toBe(32000);
    });

    it('should allow setting port number on new modules', () => {
        try {
            module.port = 64000;
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.port = 32023;
        expect(new_mod.port).not.toBe(32023);
        expect(new_mod.changes.port).toBe(32023);
    });

    it('should expose makebreak', () => {
        expect(module.makebreak).toBe(false);
    });

    it('should allow setting port number on new modules', () => {
        try {
            module.makebreak = true;
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.makebreak = true;
        expect(new_mod.makebreak).not.toBe(true);
        expect(new_mod.changes.makebreak).toBe(true);
    });

    it('should expose uri', () => {
        expect(module.uri).toBe('test.com');
    });

    it('should allow setting port number on new modules', () => {
        try {
            module.uri = 'yoda.force';
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.uri = 'o.bi.wan';
        expect(new_mod.uri).not.toBe('o.bi.wan');
        expect(new_mod.changes.uri).toBe('o.bi.wan');
    });

    it('should expose custom name', () => {
        expect(module.custom_name).toBe('mi-name');
    });

    it('should allow setting custom name', () => {
        module.custom_name = 'Crystal';
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
            module.role = EngineDriverRole.SSH;
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.role = EngineDriverRole.Logic;
        expect(new_mod.role).not.toBe(EngineDriverRole.Logic);
        expect(new_mod.changes.role).toBe(EngineDriverRole.Logic);
    });

    it('should expose notes', () => {
        expect(module.notes).toEqual('Clone wars');
    });

    it('should allow updating module notes', () => {
        const new_notes = 'Phantom menance';
        module.notes = new_notes;
        expect(module.notes).not.toBe(new_notes);
        expect(module.changes.notes).toBe(new_notes);
    });

    it('should expose ignore connected', () => {
        expect(module.ignore_connected).toBe(false);
    });

    it('should allow setting ignore connected on new modules', () => {
        try {
            module.ignore_connected = true;
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'));
        }
        const new_mod = new EngineModule(service, {});
        new_mod.ignore_connected = true;
        expect(new_mod.ignore_connected).not.toBe(true);
        expect(new_mod.changes.ignore_connected).toBe(true);
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
