import { HashMap } from '../../../utilities/types.utilities'

import { IResourceService } from './resources.interface'

export abstract class EngineResource<T = any> {
    /** Unique Identifier of the object */
    public readonly id: string
    /** Human readable name of the object */
    private _name: string
    /** Map of unsaved property changes */
    private _changes: HashMap = {}

    constructor(protected service: IResourceService<T>, raw_data: HashMap) {
        this.id = raw_data.id
        this._name = raw_data.name
    }

    /** Human readable name of the object */
    public get name(): string {
        return this._name
    }
    /** Setter for name property. The value needs to be saved before it can be used */
    public set name(value: string) {
        this.change('name', value)
    }

    /**
     * Save any changes made to the server
     */
    public async save(): Promise<T> {
        if (Object.keys(this._changes).length > 0) {
            return this.id
                ? this.service.update(this.id, { ...this, ...this._changes })
                : this.service.add({ ...this, ...this._changes })
        } else {
            return Promise.reject('No changes have been made')
        }
    }

    /**
     * Make request to delete the resource on the server
     */
    public delete(): Promise<void> {
        return this.service.delete(this.id)
    }

    /**
     * Get map of changes to the resources
     */
    public get changes(): HashMap {
        return { ...this._changes }
    }

    /**
     * Update the value of a property
     * @param prop_name Name of the property
     * @param value New value for the property
     */
    protected change<T = any>(prop_name: string, value: T) {
        this._changes[prop_name] = value
    }
}
