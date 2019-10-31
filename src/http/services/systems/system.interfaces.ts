import { HashMap } from '../../../utilities/types.utilities';
import { EngineResourceQueryOptions } from '../resources/resources.interface';

export interface EngineModuleFunctionMap extends HashMap<EngineModuleFunction> {}

export interface EngineModuleFunction {
    /** Arity of the function. See https://apidock.com/ruby/Method/arity */
    arity: number;
    /** List of available paramters for the function */
    params: string[];
}

/** Allowable query parameters for systems index endpoint */
export interface EngineSystemsQueryOptions extends EngineResourceQueryOptions {
    /** Zone ID to filter the returned values on */
    zone_id?: string;
    /** Driver ID to filter the returned values on */
    module_id?: string;
}

/** Allowable query parameters for systems show endpoint */
export interface EngineSystemShowOptions {
    /** Whether to return zone and module data for the system */
    complete?: boolean;
}
