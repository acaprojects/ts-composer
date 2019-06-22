/** Mapping of available query paramters for the zones index endpoint */
export interface IEngineZoneQuery {
    /** Search filter supporting the following syntax https://www.elastic.co/guide/en/elasticsearch/reference/5.5/query-dsl-simple-query-string-query.html */
    q?: string
    /** Number of results to return. Defaults to `20`. Max `500` */
    limit?: number
    /** Offset the page of results. Max `10000` */
    offset?: number
    /** List of space seperated tags to filter the results */
    tag?: string
}

/** Mapping of available query parameters for the zones show endpoint */
export interface IEngineZoneShow {
    /** Includes trigger data in the response (must have support or admin permissions) */
    complete?: boolean
    /** Returns the specified settings key if the key exists in the zone (available to all authenticated users) */
    data?: string
}
