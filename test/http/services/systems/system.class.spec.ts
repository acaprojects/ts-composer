import { Composer } from '../../../../src/composer';
import { EngineSettings } from '../../../../src/http/services/settings/settings.class';
import { EngineSystem } from '../../../../src/http/services/systems/system.class';

describe('EngineSystem', () => {
    let system: EngineSystem;
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
            update: jest.fn()
        };
        system = new EngineSystem(service, {
            id: 'sys-test',
            description: 'A description',
            email: 'system@acaengine.com',
            capacity: 10,
            features,
            bookable: true,
            installed_ui_devices: 4,
            support_url: '/support/test',
            modules,
            zones,
            settings: { settings_string: '{ test: 1 }' }
        });
        (Composer as any)._initialised.next(true);
    });

    it('should create instance', () => {
        expect(system).toBeTruthy();
        expect(system).toBeInstanceOf(EngineSystem);
    });

    it('should expose description', () => {
        expect(system.description).toBe('A description');
        system.storePendingChange('description', 'New description');
        expect(system.description).not.toBe('New description');
        expect(system.changes.description).toBe('New description');
    });

    it('should expose email', () => {
        expect(system.email).toBe('system@acaengine.com');
        system.storePendingChange('email', 'system@not.acaengine.com');
        expect(system.email).not.toBe('system@not.acaengine.com');
        expect(system.changes.email).toBe('system@not.acaengine.com');
    });

    it('should expose capacity', () => {
        expect(system.capacity).toBe(10);
        system.storePendingChange('capacity', 8);
        expect(system.capacity).not.toBe(8);
        expect(system.changes.capacity).toBe(8);
    });

    it('should expose features', () => {
        expect(system.features).toBe(features);
    });

    it('should expose bookable', () => {
        expect(system.bookable).toBe(true);
        system.storePendingChange('bookable', false);
        expect(system.bookable).not.toBe(false);
        expect(system.changes.bookable).toBe(false);
    });

    it('should expose installed_ui_devices', () => {
        expect(system.installed_ui_devices).toBe(4);
        system.storePendingChange('installed_ui_devices', 8);
        expect(system.installed_ui_devices).not.toBe(8);
        expect(system.changes.installed_ui_devices).toBe(8);
    });

    it('should expose support_url', () => {
        expect(system.support_url).toBe('/support/test');
        system.storePendingChange('support_url', 'http://test.yesh');
        expect(system.support_url).not.toBe('http://test.yesh');
        expect(system.changes.support_url).toBe('http://test.yesh');
    });

    it('should expose module list', () => {
        expect(system.modules).toEqual(modules);
    });

    it('should expose zone list', () => {
        expect(system.zones).toEqual(zones);
    });

    it('should expose settings', () => {
        expect(system.settings).toBeInstanceOf(EngineSettings);
    });

    it('should error on tasks when system has no ID', async () => {
        const sys = new EngineSystem(service, {});
        try {
            await sys.start();
            throw Error('Error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Error'));
        }
        try {
            await sys.stop();
            throw Error('Error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Error'));
        }
        try {
            await sys.types();
            throw Error('Error');
        } catch (e) {
            expect(e).not.toEqual(new Error('Error'));
        }
    });

    it('should allow starting the system', async () => {
        service.start.mockReturnValue(Promise.resolve());
        await system.start();
        expect(service.start).toBeCalledWith('sys-test');
    });

    it('should allow stopping the system', async () => {
        service.stop.mockReturnValue(Promise.resolve());
        await system.stop();
        expect(service.stop).toBeCalledWith('sys-test');
    });

    it('should grabbing the module types for the system', async () => {
        service.types.mockReturnValue(Promise.resolve({ DeathStar: 3 }));
        const value = await system.types();
        expect(service.types).toBeCalledWith('sys-test');
        expect(value).toEqual({ DeathStar: 3 });
    });

    it('should allow adding modules', async () => {
        let value = await system.addModule('test');
        expect(value).toBe(system);
        service.update.mockReturnValue(
            Promise.resolve(new EngineSystem(service, { ...system, ...system.changes }))
        );
        value = await system.addModule('new module');
        expect(service.update).toBeCalledTimes(1);
        expect(value).not.toBe(system);
    });

    it('should allow removing modules', async () => {
        service.stop.mockReturnValue(Promise.resolve());
        await system.removeModule('test');
        expect(service.remove).toBeCalledWith('sys-test', 'test');
    });

    it('should allow adding zones', async () => {
        let value = await system.addZone('test');
        expect(value).toBe(system);
        service.update.mockReturnValue(
            Promise.resolve(new EngineSystem(service, { ...system, ...system.changes }))
        );
        value = await system.addZone('new zone');
        expect(service.update).toBeCalledTimes(1);
        expect(value).not.toBe(system);
    });

    it('should allow removing zones', async () => {
        let value = await system.removeZone('no zone');
        expect(value).toBe(system);
        service.update.mockReturnValue(
            Promise.resolve(new EngineSystem(service, { ...system, ...system.changes }))
        );
        value = await system.removeZone('test');
        expect(service.update).toBeCalledTimes(1);
        expect(value).not.toBe(system);
    });
});
