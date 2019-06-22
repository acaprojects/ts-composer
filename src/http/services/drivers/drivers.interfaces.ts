/** Mapping of available query paramters for the dependencies index */
export interface IEngineDependencyQuery {
    /** Search filter supporting the following syntax https://www.elastic.co/guide/en/elasticsearch/reference/5.5/query-dsl-simple-query-string-query.html */
    q?: string
    /** Number of results to return. Defaults to `20`. Max `500` */
    limit?: number
    /** Offset the page of results. Max `10000` */
    offset?: number
    /** Filter result by type of dependency. One of either `ssh`, `device`, `service` or `logic` */
    role?: 'ssh' | 'device' | 'service' | 'logic'
}
