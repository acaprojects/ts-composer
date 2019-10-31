import { HashMap } from '../../../utilities/types.utilities';

import { ResourceService } from './resources.interface';

export abstract class EngineResource<T extends ResourceService<any>> {

    /** Human readable name of the object */
    public get name(): string {
        return this._name;
    }
    /** Setter for name property. The value needs to be saved before it can be used */
    public set name(value: string) {
        this.change('name', value);
    }

    /**
     * Get map of changes to the resources
     */
    public get changes(): HashMap {
        return { ...this._changes };
    }
    /** Unique Identifier of the object */
    public readonly id: string;
    /** Unique Identifier of the object */
    public readonly created_at: string;
    /** Human readable name of the object */
    protected _name: string;
    /** Map of unsaved property changes */
    protected _changes: HashMap = {};
    /** Map of local property names to server ones */
    protected _server_names: HashMap = {};
    /** Version of the data */
    protected _version: number;

    constructor(protected _service: T, raw_data: HashMap) {
        this.id = raw_data.id;
        this._name = raw_data.name;
        this.created_at = raw_data.created_at;
        this._version = raw_data.version || 0;
    }

    /**
     * Save any changes made to the server
     */
    public async save(): Promise<T> {
        const me: HashMap = this.toJSON();
        if (Object.keys(this._changes).length > 0) {
            return this.id
                ? (this._service as any).update(this.id, me)
                : (this._service as any).add(me);
        } else {
            return Promise.reject('No changes have been made');
        }
    }

    /**
     * Make request to delete the resource on the server
     */
    public delete(): Promise<void> {
        return (this._service as any).delete(this.id);
    }

    /**
     * Convert object into plain object
     */
    public toJSON(this: EngineResource<T>, with_changes: boolean = true): HashMap {
        const obj: any = { ...this };
        delete obj._service;
        delete obj._changes;
        delete obj._server_names;
        const keys = Object.keys(obj);
        for (const key of keys) {
            if (key[0] === '_') {
                const new_key = this._server_names[key.substr(1)] || key.substr(1);
                obj[new_key] = obj[key];
                delete obj[key];
            } else if (obj[key] === undefined) {
                delete obj[key];
            }
        }
        return with_changes ? { ...obj, ...this._changes } : obj;
    }

    /**
     * Update the value of a property
     * @param prop_name Name of the property
     * @param value New value for the property
     */
    protected change<U = any>(prop_name: string, value: U) {
        this._changes[prop_name] = value;
    }
}
