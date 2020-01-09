import { EngineResourceQueryOptions } from '../resources/resources.interface';

/** Access level for the settings string */
export enum EncryptionLevel {
    /** Full access to the settings string */
    None = 0,
    /** Only support users are allowed to view the settings contents */
    Support = 1,
    /** Only admin users are allowed to view the settings contents */
    Admin = 2,
    /** Never show the settings contents */
    NeverDisplay = 3
}

/** Allowable query parameters for settings index endpoint */
export interface EngineSettingsQueryOptions extends EngineResourceQueryOptions {
    /** ID of the parent zone, system, module or driver to grab settings for */
    parent_id?: string;
}
