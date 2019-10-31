import { HashMap } from '../../../utilities/types.utilities';

/** Allowable query parameters for basic index endpoints */
export interface EngineResourceQueryOptions {
    /**
     * Search filter supporting the following syntax
     * https://www.elastic.co/guide/en/elasticsearch/reference/5.5/query-dsl-simple-query-string-query.html
     */
    q?: string;
    /** Number of results to return. Defaults to `20`. Max `500` */
    limit?: number;
    /** Offsets of the results to return. Max `10000` */
    offset?: number;
    /** Number of milliseconds to cache the query response */
    cache?: number;
    /** Whether the request is a API poll request */
    _poll?: boolean;
}

export interface ResourceService<T = any> {
    query: (fields?: HashMap) => Promise<T[]>;
    show: (id: string, fields?: HashMap) => Promise<T>;
    add: (data: HashMap) => Promise<T>;
    update: (id: string, data: HashMap) => Promise<T>;
    delete: (id: string) => Promise<void>;
}
