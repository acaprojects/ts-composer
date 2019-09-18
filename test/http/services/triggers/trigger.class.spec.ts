import { EngineTrigger } from '../../../../src/http/services/triggers/trigger.class';

describe('EngineZone', () => {
    let trigger: EngineTrigger;
    let service: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        trigger = new EngineTrigger(service, {
            id: 'dep-test',
            description: 'In a galaxy far far away...',
            settings: { today: false, future: 'Yeah!' },
            triggers: ['trig-001'],
            created_at: 999
        });
    });

    it('should create instance', () => {
        expect(trigger).toBeTruthy();
        expect(trigger).toBeInstanceOf(EngineTrigger);
    });

    it('should expose description', () => {
        expect(trigger.description).toBe('In a galaxy far far away...');
    });
});
