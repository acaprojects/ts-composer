import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineUsersService } from './users.service';

export const USER_MUTABLE_FIELDS = [
    'name',
    'email',
    'authority_id',
    'email',
    'phone',
    'country',
    'image',
    'metadata',
    'login_name',
    'staff_id',
    'first_name',
    'last_name',
    'support',
    'sys_admin'
] as const;
type UserMutableTuple = typeof USER_MUTABLE_FIELDS;
export type UserMutableFields = UserMutableTuple[number];

/** List of property keys that can only be set when creating a new object */
const NON_EDITABLE_FIELDS = ['authority_id'];

/**
 * Representation of the user model in Engine
 */
export class EngineUser extends EngineResource<EngineUsersService> {
    /** Hash of the email address of the user */
    public readonly email_digest: string;
    /** ID of the authority associated with the user */
    public readonly authority_id: string;
    /** Email address of the user */
    public readonly email: string;
    /** Phone number of the user */
    public readonly phone: string;
    /** Country that the user resides in */
    public readonly country: string;
    /** Avatar image for the user */
    public readonly image: string;
    /** Additional metadata associated with the user */
    public readonly metadata: string;
    /** Username credential of the user */
    public readonly login_name: string;
    /** Organisation ID of the user */
    public readonly staff_id: string;
    /** First name of the user */
    public readonly first_name: string;
    /** Last name of the user */
    public readonly last_name: string;
    /** Whether user is a support role */
    public readonly support: boolean;
    /** Whether user is a system admin role */
    public readonly sys_admin: boolean;

    constructor(protected _service: EngineUsersService, raw_data: HashMap) {
        super(_service, raw_data);
        this.authority_id = raw_data.authority_id || '';
        this.email = raw_data.email || '';
        this.email_digest = raw_data.email_digest || '';
        this.phone = raw_data.phone || '';
        this.country = raw_data.country || '';
        this.image = raw_data.image || '';
        this.metadata = raw_data.metadata || '';
        this.login_name = raw_data.login_name || '';
        this.staff_id = raw_data.staff_id || '';
        this.first_name = raw_data.first_name || '';
        this.last_name = raw_data.last_name || '';
        this.support = !!raw_data.support;
        this.sys_admin = !!raw_data.sys_admin;
    }

    public storePendingChange(
        key: UserMutableFields,
        value: EngineUser[UserMutableFields]
    ): this {
        if (this.id && NON_EDITABLE_FIELDS.indexOf(key) >= 0) {
            throw new Error(`Property "${key}" is not editable.`);
        }
        return super.storePendingChange(key as any, value);
    }
}
