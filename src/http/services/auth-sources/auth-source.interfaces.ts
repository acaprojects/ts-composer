import { EngineResourceQueryOptions } from '../resources/resources.interface';

/** Mapping of available query paramters for the modules index */
export interface EngineAuthSourceQueryOptions extends EngineResourceQueryOptions {
    /** ID of the authority to filter the auth sources */
    authority?: string;
}
