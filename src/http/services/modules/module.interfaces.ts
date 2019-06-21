/** Mapping of available query paramters for the modules index */
export interface IEngineModuleQuery {
    /** Search filter supporting the following syntax https://www.elastic.co/guide/en/elasticsearch/reference/5.5/query-dsl-simple-query-string-query.html */
    q?: string
    /** Number of results to return. Defaults to `20`. Max `500` */
    limit?: number
    /** Offset the page of results. Max `10000` */
    offset?: number
    /** Returns modules that are in the given system */
    system_id?: string
    /** Returns modules with the given dependency */
    dependency_id?: string
    /** Return results that connected state matches this value */
    connected?: boolean
    /** Return modules that are running or not stopped */
    running?: boolean
    /** Returns modules that are not logic modules (i.e. they connect to a device or service) */
    no_logic?: boolean
    /** Returns modules that have not been updated since the value defined as seconds since UTC epoch */
    as_of?: number
}

/** Engine response from `ping` module task endpoint `/control/api/<mod_id>/ping` */
export interface IEngineModulePing {
    /** Host address of the module device */
    host: string
    /** Whether the host address was pingable */
    pingable: boolean
    /** Any warning returned from the ping attempt */
    warning?: string
    /** Any exception thrown from the ping attempt */
    exception?: string
}

/** Allowed roles for Engine Modules */
export enum EngineModuleRole {
    SSH = 0,
    Device = 1,
    Service = 2,
    Logic = 3
}
