import { EngineResourceQueryOptions } from '../resources/resources.interface';

/** Mapping of available query paramters for the zones index endpoint */
export interface EngineZoneQueryOptions extends EngineResourceQueryOptions {
    /** List of space seperated tags to filter the results */
    tag?: string;
    /** ID of the system to filter the results */
    sys_id?: string;
}

/** Mapping of available query parameters for the zones show endpoint */
export interface EngineZoneShowOptions {
    /** Includes trigger data in the response (must have support or admin permissions) */
    complete?: boolean;
    /** Returns the specified settings key if the key exists in the zone (available to all authenticated users) */
    data?: string;
}
