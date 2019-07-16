import { EngineResource } from '../resources/resource.class'
import { EngineApplicationsService } from './applications.service'
import { HashMap } from '../../../utilities/types.utilities'

export class EngineApplication extends EngineResource<EngineApplicationsService> {
    /** ID of the domain that owns this application */
    public get owner_id(): string {
        return this._owner_id
    }

    public set owner_id(value: string) {
        this.change('owner_id', value)
    }
    /** Access scopes required by users to access the application */
    public get scopes(): string {
        return this._scopes
    }

    public set scopes(value: string) {
        this.change('scopes', value)
    }
    /** Authentication redirect URI */
    public get redirect_uri(): string {
        return this._redirect_uri
    }

    public set redirect_uri(value: string) {
        this.change('redirect_uri', value)
    }
    /** Skip authorization checks for the application */
    public get skip_authorization(): boolean {
        return this._skip_authorization
    }

    public set skip_authorization(value: boolean) {
        this.change('skip_authorization', value)
    }

    /** Timestamp the zone was created at, in ms since UTC epoch */
    public readonly created_at: number
    /** Unique identifier of the application */
    public readonly uid: string
    /** Secret associated with the application */
    public readonly secret: string
    /** ID of the domain that owns this application */
    private _owner_id: string
    /** Access scopes required by users to access the application */
    private _scopes: string
    /** Authentication redirect URI */
    private _redirect_uri: string
    /** Skip authorization checks for the application */
    private _skip_authorization: boolean

    constructor(protected service: EngineApplicationsService, raw_data: HashMap) {
        super(service, raw_data)
        this.created_at = raw_data.created_at
        this.uid = raw_data.uid
        this.secret = raw_data.secret
        this._owner_id = raw_data.owner_id
        this._scopes = raw_data.scopes
        this._redirect_uri = raw_data.redirect_uri
        this._skip_authorization = raw_data.skip_authorization
    }
}
