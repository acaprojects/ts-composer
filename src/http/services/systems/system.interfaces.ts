export interface IEngineModuleFunctionMap {
    [fn_name: string]: {
        /** Arity of the function. See https://apidock.com/ruby/Method/arity */
        arity: number
        /**  */
        params: string[]
    }
}

/** Allowable query parameters for systems index endpoint */
export interface IEngineSystemsQuery {
    /** Search filter supporting the following syntax https://www.elastic.co/guide/en/elasticsearch/reference/5.5/query-dsl-simple-query-string-query.html */
    q?: string
    /** Number of results to return. Defaults to `20`. Max `500` */
    limit?: number
    /** Offsets of the results to return. Max `10000` */
    offset?: number
    /** Zone ID to filter the returned values on */
    zone_id?: string
    /** Driver ID to filter the returned values on */
    module_id?: string
}

/** Allowable query parameters for systems show endpoint */
export interface IEngineSystemShow {
    /** Whether to return zone and module data for the system */
    complete?: boolean
}
