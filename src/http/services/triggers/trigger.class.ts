import { HashMap } from '../../../utilities/types.utilities';
import { HttpVerb } from '../../http.interfaces';
import { EngineResource } from '../resources/resource.class';
import { EngineSystemTriggersService } from './system-triggers.service';
import { TriggerActions, TriggerConditions } from './trigger.interfaces';
import { EngineTriggersService } from './triggers.service';

export const TRIGGER_MUTABLE_FIELDS = [
    'name',
    'description',
    'enabled',
    'enable_webhook',
    'supported_methods',
    'actions',
    'conditions',
    'debounce_period',
    'important',
    'system_id'
] as const;
type TriggerMutableTuple = typeof TRIGGER_MUTABLE_FIELDS;
export type TriggerMutableFields = TriggerMutableTuple[number];

/** List of property keys that can only be set when creating a new object */
const NON_EDITABLE_FIELDS = ['system_id'];

export class EngineTrigger extends EngineResource<
    EngineTriggersService | EngineSystemTriggersService
> {
    /** Name of the system assocaited with the trigger */
    public readonly system_name: string;
    /** Number of times the trigger has been activated/triggered */
    public readonly activated_count: string;
    /** Description of the trigger */
    public readonly description: string;
    /** Duration with which to ignore sequential activations of the trigger */
    public readonly debounce_period: number;
    /** Whether the trigger should take priority */
    public readonly important: boolean;
    /** Whether trigger is enabled on the associated zone or system */
    public readonly enabled: boolean;
    /** Whether the trigger can call webhooks */
    public readonly enable_webhook: boolean;
    /** HTTP verbs supported by the webhook */
    public readonly supported_methods: readonly HttpVerb[];
    /** ID of the system associated with the trigger */
    public readonly control_system_id: string;
    /** ID of the zone associated with the trigger */
    public readonly zone_id: string;

    /** ID of the system associated with the trigger */
    public get system_id(): string {
        return this.control_system_id;
    }

    /** Actions to perform when the trigger is activated */
    public get actions(): TriggerActions {
        const actions = this._actions || { functions: [], mailers: [] };
        const fn_list = (actions.functions || []).map(i => ({ ...i, args: { ...(i.args || {}) } }));
        const mail_list = (actions.mailers || []).map(i => ({ ...i, emails: [...i.emails] }));
        return { functions: fn_list, mailers: mail_list };
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
        return { comparisons: cmp_list, time_dependents: time_list };
    }

    /** Actions to perform when the trigger is activated */
    private _actions: TriggerActions;
    /** Conditions for activating the trigger */
    private _conditions: TriggerConditions;

    constructor(
        protected _service: EngineTriggersService | EngineSystemTriggersService,
        raw_data: HashMap
    ) {
        super(_service, raw_data);
        this.description = raw_data.description || '';
        this._actions = raw_data.actions || { functions: [], mailers: [] };
        this._conditions = raw_data.conditions || { comparisons: [], time_dependents: [] };
        this.debounce_period = raw_data.debounce_period || -1;
        this.important = raw_data.important || false;
        this.enabled = raw_data.enabled || false;
        this.control_system_id = raw_data.system_id || raw_data.control_system_id || '';
        this.zone_id = raw_data.zone_id || '';
        this.system_name =
            raw_data.system_name || (raw_data.control_system ? raw_data.control_system.name : '');
        this.enable_webhook = raw_data.enable_webhook || false;
        this.supported_methods = raw_data.supported_methods || ['POST'];
        this.activated_count = raw_data.activated_count || raw_data.trigger_count || 0;
    }

    public storePendingChange(
        key: TriggerMutableFields,
        value: EngineTrigger[TriggerMutableFields]
    ): this {
        if (this.id && NON_EDITABLE_FIELDS.indexOf(key) >= 0) {
            throw new Error(`Property "${key}" is not editable.`);
        }
        return super.storePendingChange(key as any, value);
    }
}
