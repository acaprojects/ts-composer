import { EngineResourceQueryOptions } from '../resources/resources.interface';

/** Mapping of available query paramters for the users index */
export interface EngineUserQueryOptions extends EngineResourceQueryOptions {
    /** Return only users on the given domain */
    authority_id?: string;
}
