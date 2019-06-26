import { HashMap } from '../../../utilities/types.utilities'

import { IResourceService } from './resources.interface'

export abstract class EngineResource<T = IResourceService<any>> {
    /** Unique Identifier of the object */
    public readonly id: string
    /** Human readable name of the object */
    protected _name: string
    /** Map of unsaved property changes */
    protected _changes: HashMap = {}

    constructor(protected service: T, raw_data: HashMap) {
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
    public async save(): Promise<EngineResource> {
        const changes: HashMap = this.changes
        const me: EngineResource = this as any
        if (Object.keys(this._changes).length > 0) {
            return this.id
                ? (this.service as any).update(this.id, { ...me, ...changes })
                : (this.service as any).add({ ...me, ...changes })
        } else {
            return Promise.reject('No changes have been made')
        }
    }

    /**
     * Make request to delete the resource on the server
     */
    public delete(): Promise<void> {
        return (this.service as any).delete(this.id)
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
