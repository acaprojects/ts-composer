import { EngineTrigger } from '../../../../src/http/services/triggers/trigger.class';
import {
    ConditionOperator,
    TimeConditionType,
    TriggerActions,
    TriggerConditions,
    TriggerWebhookType
} from '../../../../src/http/services/triggers/trigger.interfaces';

describe('EngineTrigger', () => {
    let trigger: EngineTrigger;
    let service: any;
    const actions: TriggerActions = {
        functions: [{ mod: 'mod-42', method: 'meaning', args: { purpose: 'what' } }],
        mailers: [{ emails: ['support@acaprojects.net'], content: 'Here be some contents' }]
    };
    const conditions: TriggerConditions = {
        comparisons: [],
        time_dependents: [{ type: TimeConditionType.AT, time: '' }],
        webhooks: [{ type: TriggerWebhookType.ExecuteBefore, payload: '' }]
    };

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        trigger = new EngineTrigger(service, {
            id: 'tri-test',
            control_system_id: 'sys-42',
            description: 'In a galaxy far far away...',
            debounce_period: 1000,
            important: true,
            settings: { today: false, future: 'Yeah!' },
            created_at: 999,
            actions,
            conditions
        });
    });

    it('should create instance', () => {
        expect(trigger).toBeTruthy();
        expect(trigger).toBeInstanceOf(EngineTrigger);
    });

    it('should expose system id', () => {
        expect(trigger.system_id).toBe('sys-42');
    });

    it('should allow setting system id on new systems', () => {
        try {
            trigger.system_id = 'life';
            throw Error('Failed to throw error');
        } catch (e) {
            expect(e).toEqual(new Error('System ID cannot be changed from it\'s initial value'));
        }
        const trig = new EngineTrigger(service, {});
        trig.system_id = 'life-is-42';
        expect(trig.system_id).not.toBe('life-is-42');
        expect(trig.changes.system_id).toBe('life-is-42');
    });

    it('should expose description', () => {
        expect(trigger.description).toBe('In a galaxy far far away...');
        trigger.description = 'In a not so distant galaxy...';
        expect(trigger.description).not.toBe('In a not so distant galaxy...');
        expect(trigger.changes.description).toBe('In a not so distant galaxy...');
    });

    it('should expose debounce period', () => {
        expect(trigger.debounce_period).toBe(1000);
        trigger.debounce_period = 9999;
        expect(trigger.debounce_period).not.toBe(9999);
        expect(trigger.changes.debounce_period).toBe(9999);
    });

    it('should expose important', () => {
        expect(trigger.important).toBe(true);
        trigger.important = false;
        expect(trigger.important).not.toBe(false);
        expect(trigger.changes.important).toBe(false);
    });

    it('should expose actions', () => {
        expect(trigger.actions).toEqual(actions);
        const old_actions = trigger.actions;
        actions.functions.push({
            mod: 'mod-hello',
            method: 'greeting',
            args: { message: 'Hello peeps!', marquee: true }
        });
        expect(old_actions).not.toEqual(trigger.actions);
        const new_actions: any = {
            functions: [
                { mod: 'mod-36', method: 'meaning', args: { purpose: 'what' } },
                {
                    mod: 'mod-hello',
                    method: 'greeting',
                    args: { message: 'Hello peeps!', marquee: true }
                }
            ],
            mailers: null
        };
        trigger.actions = new_actions;
        expect(trigger.actions).not.toEqual(new_actions);
        expect(trigger.changes.actions).toEqual(new_actions);
    });

    it('should expose conditions', () => {
        expect(trigger.conditions).toEqual(conditions);
        const old_conditions = trigger.conditions;
        conditions.comparisons.push({
            left: 'hello',
            operator: ConditionOperator.AND,
            right: 'nope'
        });
        expect(old_conditions).not.toEqual(trigger.conditions);
        const new_conditions: any = {
            comparisons: [],
            time_dependents: [],
            webhooks: null
        };
        trigger.conditions = new_conditions;
        expect(trigger.conditions).not.toEqual(new_conditions);
        expect(trigger.changes.conditions).toEqual(new_conditions);
    });

    it('should have default values', () => {
        trigger = new EngineTrigger(service, {});
        expect(trigger.actions).toBeInstanceOf(Object);
        expect(trigger.conditions).toBeInstanceOf(Object);
        trigger = new EngineTrigger(service, { actions: {}, conditions: {} });
        expect(trigger.actions).toBeInstanceOf(Object);
        expect(trigger.conditions).toBeInstanceOf(Object);
    });
});
