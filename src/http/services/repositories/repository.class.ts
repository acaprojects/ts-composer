import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineRepositoriesService } from './repositories.service';
import { EngineRepositoryType } from './repository.interfaces';

import * as _dayjs from 'dayjs';
// tslint:disable-next-line:no-duplicate-imports
import { Dayjs, default as _rollupDayjs } from 'dayjs';
/**
 * @hidden
 */
const dayjs = _rollupDayjs || _dayjs;

export class EngineRepository extends EngineResource<EngineRepositoriesService> {

    /** Name of the folder on the server to pull the repository */
    private _folder_name: string;
    /** Description of the contents of the repository */
    private _description: string;
    /** URI that the repository can be pulled from */
    private _uri: string;
    /** Hash of the commit at the head of the repository */
    private _commit_hash: string;
    /** Repository type */
    private _type: EngineRepositoryType;

    /** Name of the folder on the server to pull the repository */
    public get folder_name(): string {
        return this._folder_name;
    }
    public set folder_name(value: string) {
        this.change('folder_name', value);
    }

    /** Description of the contents of the repository */
    public get description(): string {
        return this._description;
    }
    public set description(value: string) {
        this.change('description', value);
    }

    /** URI that the repository can be pulled from */
    public get uri(): string {
        return this._uri;
    }
    public set uri(value: string) {
        this.change('uri', value);
    }

    /** Repository type */
    public get type(): EngineRepositoryType {
        return this._type;
    }
    public set type(value: EngineRepositoryType) {
        this.change('type', value);
    }

    constructor(protected _service: EngineRepositoriesService, raw_data: HashMap) {
        super(_service, raw_data);
        this.name = raw_data.name || '';
        this._folder_name = raw_data.folder_name || '';
        this._description = raw_data.description || '';
        this._uri = raw_data.uri || '';
        this._commit_hash = raw_data.commit_hash || '';
        this._type = raw_data.type || EngineRepositoryType.Driver;
    }
}
