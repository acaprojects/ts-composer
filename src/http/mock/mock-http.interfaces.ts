import { HashMap } from '../../utilities/types.utilities'

/** Interface for data needed to handle Mock HTTP requests */
export interface MockHttpRequestHandler<T = any> {
    /** URL path handled by the object */
    path: string
    /** Data related to the  */
    metadata: any
    /** HTTP Verb the handler is associated with */
    method: HttpVerb
    /** Callback for handling request to the associated URL */
    callback: (handler: MockHttpRequest<T>) => T
    /** Parameter keys for set path */
    path_parts: string[]
    /** Parameter keys for set path */
    path_structure: string[]
}

export interface MockHttpRequest<T = any> {
    /** URL path requested */
    path: string
    /** Request method */
    method: HttpVerb
    metadata: any
    route_params: HashMap<string>
    query_params: HashMap<string>
}
