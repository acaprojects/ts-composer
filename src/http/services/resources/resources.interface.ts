import { HashMap } from '../../../utilities/types.utilities'

export interface IResourceService<T = any> {
    query: (fields?: HashMap) => Promise<T[]>
    show: (id: string, fields?: HashMap) => Promise<T[]>
    add: (data: HashMap) => Promise<T>
    update: (id: string, data: HashMap) => Promise<T>
    delete: (id: string) => Promise<void>
}
