/** Mapping of available query paramters for the dependencies index */
export interface EngineDriverQueryOptions {
    /** Filter result by type of dependency. One of either `ssh`, `device`, `service` or `logic` */
    role?: 'ssh' | 'device' | 'service' | 'logic';
}
