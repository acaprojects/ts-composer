import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineSystemTriggersService } from './system-triggers.service';
import { Args, TriggerActions, TriggerConditions } from './trigger.interfaces';
import { EngineTriggersService } from './triggers.service';

export class EngineTrigger extends EngineResource<
    EngineTriggersService | EngineSystemTriggersService
> {
    /** Description of the trigger */
    public get description(): string {
        return this._description;
    }
    public set description(value: string) {
        this.change('description', value);
    }

    /** Actions to perform when the trigger is activated */
    public get actions(): TriggerActions {
        const actions = this._actions || { functions: [], mailers: [] };
        const fn_list = (actions.functions || []).map(i => ({ ...i, args: { ...(i.args || {}) } }));
        const mail_list = (actions.mailers || []).map(i => ({ ...i, emails: [...i.emails] }));
        return { functions: fn_list, mailers: mail_list };
    }
    public set actions(value: TriggerActions) {
        this.change('actions', value);
    }

    /** Conditions for activating the trigger */
    public get conditions(): TriggerConditions {
        const conditions = this._conditions || {
            comparisons: [],
            time_dependents: [],
            webhooks: []
        };
        const cmp_list = (conditions.comparisons || []).map(i => ({
            ...i,
            left: typeof i.left === 'object' ? { ...i.left } : i.left,
            right: typeof i.right === 'object' ? { ...i.right } : i.right
        }));
        const time_list = (conditions.time_dependents || []).map(i => ({ ...i }));
        const hook_list = (conditions.webhooks || []).map(i => ({ ...i }));
        return { comparisons: cmp_list, time_dependents: time_list, webhooks: hook_list };
    }
    public set conditions(value: TriggerConditions) {
        this.change('conditions', value);
    }
    /** Duration with which to ignore sequential activations of the trigger */
    public get debounce_period(): number {
        return this._debounce_period;
    }
    public set debounce_period(value: number) {
        this.change('debounce_period', value);
    }
    /** Whether the trigger should take priority */
    public get important(): boolean {
        return this._important;
    }
    public set important(value: boolean) {
        this.change('important', value);
    }
    /** System associated with the trigger */
    public get system_id(): string {
        return this._system_id;
    }
    public set system_id(value: string) {
        if (this.id) {
            throw new Error('System ID cannot be changed from it\'s initial value');
        }
        this.change('system_id', value);
    }
    /** Description of the trigger */
    private _description: string;
    /** Actions to perform when the trigger is activated */
    private _actions: TriggerActions;
    private _temp_actions?: TriggerActions;
    /** Conditions for activating the trigger */
    private _conditions: TriggerConditions;
    private _temp_conditions?: TriggerConditions;
    /** Duration with which to ignore sequential activations of the trigger */
    private _debounce_period: number;
    /** Whether the trigger should take priority */
    private _important: boolean;
    /** System associated with the trigger */
    private _system_id: string;

    constructor(
        protected service: EngineTriggersService | EngineSystemTriggersService,
        raw_data: HashMap
    ) {
        super(service, raw_data);
        this._description = raw_data.description;
        this._actions = raw_data.actions;
        this._conditions = raw_data.conditions;
        this._debounce_period = raw_data.debounce_period;
        this._important = raw_data.important;
        this._system_id = raw_data.system_id || raw_data.control_system_id;
    }
}
