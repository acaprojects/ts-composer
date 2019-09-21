/** Mapping of available query paramters for the application index endpoint */
export interface EngineApplicationQueryOptions {
    /**
     * Search filter supporting the following syntax
     * https://www.elastic.co/guide/en/elasticsearch/reference/5.5/query-dsl-simple-query-string-query.html
     */
    q?: string;
    /** Number of results to return. Defaults to `20`. Max `500` */
    limit?: number;
    /** Offset the page of results. Max `10000` */
    offset?: number;
}
