import { ACAEngine } from '../../../../src/acaengine';
import { EngineSettings } from '../../../../src/http/services/settings/settings.class';
import { EngineZone } from '../../../../src/http/services/zones/zone.class';

describe('EngineZone', () => {
    let zone: EngineZone;
    let service: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        jest.spyOn(ACAEngine, 'settings', 'get').mockReturnValue(null as any);
        jest.spyOn(ACAEngine, 'triggers', 'get').mockReturnValue(null as any);
        zone = new EngineZone(service, {
            id: 'dep-test',
            description: 'In a galaxy far far away...',
            settings: { settings_string: '{ today: false, future: \'Yeah!\' }' },
            triggers: ['trig-001'],
            created_at: 999,
            trigger_data: [{ id: 'trig-01', name: 'A trigger' }]
        });
        (ACAEngine as any)._initialised.next(true);
    });

    it('should create instance', () => {
        expect(zone).toBeTruthy();
        expect(zone).toBeInstanceOf(EngineZone);
    });

    it('should have trigger data', (done) => {
        setTimeout(() => {
            expect(zone.trigger_list).toBeTruthy();
            expect(zone.trigger_list.length).toBe(1);
            done();
        }, 1);
    });

    it('should expose description', () => {
        expect(zone.description).toBe('In a galaxy far far away...');
    });

    it('should allow setting description', () => {
        zone.storePendingChange('description', 'another-desc');
        expect(zone.description).not.toBe('another-desc');
        expect(zone.changes.description).toBe('another-desc');
    });

    it('should expose settings', () => {
        expect(zone.settings).toBeInstanceOf(EngineSettings);
    });

    it('should expose triggers', () => {
        expect(zone.triggers).toEqual(['trig-001']);
    });

    it('should expose class name', () => {
        expect(zone.created_at).toEqual(999);
    });
});
