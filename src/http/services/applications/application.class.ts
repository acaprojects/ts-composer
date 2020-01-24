import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineApplicationsService } from './applications.service';

export const APPLICATION_MUTABLE_FIELDS = [
    'name',
    'owner_id',
    'scopes',
    'redirect_uri',
    'skip_authorization'
] as const;
type ApplicationMutableTuple = typeof APPLICATION_MUTABLE_FIELDS;
export type ApplicationMutableFields = ApplicationMutableTuple[number];

export class EngineApplication extends EngineResource<EngineApplicationsService> {
    /** Unique identifier of the application */
    public readonly uid: string;
    /** Secret associated with the application */
    public readonly secret: string;
    /** ID of the domain that owns this application */
    public readonly owner_id: string;
    /** Access scopes required by users to access the application */
    public readonly scopes: string;
    /** Authentication redirect URI */
    public readonly redirect_uri: string;
    /** Skip authorization checks for the application */
    public readonly skip_authorization: boolean;

    constructor(protected _service: EngineApplicationsService, raw_data: HashMap) {
        super(_service, raw_data);
        this.uid = raw_data.uid || '';
        this.secret = raw_data.secret || '';
        this.owner_id = raw_data.owner_id || '';
        this.scopes = raw_data.scopes || '';
        this.redirect_uri = raw_data.redirect_uri || '';
        this.skip_authorization = raw_data.skip_authorization || false;
    }

    public storePendingChange(
        key: ApplicationMutableFields,
        value: EngineApplication[ApplicationMutableFields]
    ): this {
        return super.storePendingChange(key as any, value);
    }
}
