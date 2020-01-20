
export interface Trigger {
    /** Name of the trigger */
    name: string;
    /** Description of the trigger */
    description: string;
    /** Actions to perform when the trigger is activated */
    actions?: TriggerActions;
    /** Conditions for activating the trigger */
    conditions?: TriggerConditions;
    /** Duration with which to ignore sequential activations of the trigger */
    debounce_period: number;
    /** Whether the trigger should take priority */
    important: boolean;
    /** System associated with the trigger */
    control_system_id: string;
}

export interface TriggerActions {
    functions: TriggerFunction[];
    mailers: Mailer[];
}

export interface Mailer {
    emails: string[];
    content: string;
}

export interface TriggerFunction {
    mod: string;
    method: string;
    args?: Args;
}

export interface Args {
    [argument: string]: any;
}

export interface TriggerConditions {
    comparisons: TriggerComparison[];
    time_dependents: TimeCondition[];
}

export interface TriggerComparison {
    left: ConditionValue;
    operator: ConditionOperator;
    right: ConditionValue;
}

export enum ConditionOperator {
    EQ = 'equal',
    NEQ = 'not_equal',
    GT = 'greater_than',
    GTE = 'greater_than_or_equal',
    LT = 'less_than',
    LTE = 'less_than_or_equal',
    AND = 'and',
    OR = 'or',
    XOR = 'exclusive_or'
}

export type ConditionValue = TriggerStatusVariable | ConditionConstant;

export type ConditionConstant = number | string | boolean;

export interface TriggerStatusVariable {
    mod: string;
    status: string;
    keys: string[];
}

export interface TimeCondition {
    type: TimeConditionType;
    time?: string;
    cron?: string;
}

export enum TimeConditionType {
    AT = 'at',
    CRON = 'cron'
}

export interface TriggerWebhook {
    type: TriggerWebhookType;
    payload?: string;
}

export enum TriggerWebhookType {
    ExecuteBefore,
    ExecuteAfter,
    PayloadOnly,
    IgnorePayload
}
