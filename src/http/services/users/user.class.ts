import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineUsersService } from './users.service';

/**
 * Representation of the user model in Engine
 */
export class EngineUser extends EngineResource<EngineUsersService> {
    /** ID of the authority associated with the user */
    public get authority_id(): string {
        return this._authority_id;
    }

    public set authority_id(value: string) {
        if (this.id) {
            throw new Error('Authority ID cannot be changed from it\'s initial value');
        }
        this.change('authority_id', value);
    }

    /** Email address of the user */
    public get email(): string {
        return this._email;
    }

    public set email(value: string) {
        this.change('email', value);
    }

    /** Phone number of the user */
    public get phone(): string {
        return this._phone;
    }

    public set phone(value: string) {
        this.change('phone', value);
    }

    /** Country where the user resides */
    public get country(): string {
        return this._country;
    }

    public set country(value: string) {
        this.change('country', value);
    }

    /** Avatar image for the user */
    public get image(): string {
        return this._image;
    }

    public set image(value: string) {
        this.change('image', value);
    }

    /** Additional metadata associated with the user */
    public get metadata(): string {
        return this._metadata;
    }

    public set metadata(value: string) {
        this.change('metadata', value);
    }

    /** Username credential of the user */
    public get login_name(): string {
        return this._login_name;
    }

    public set login_name(value: string) {
        this.change('login_name', value);
    }

    /** Organisation ID of the user */
    public get staff_id(): string {
        return this._staff_id;
    }

    public set staff_id(value: string) {
        this.change('staff_id', value);
    }

    /** First name of the user */
    public get first_name(): string {
        return this._first_name;
    }

    public set first_name(value: string) {
        this.change('first_name', value);
    }

    /** Last name of the user */
    public get last_name(): string {
        return this._last_name;
    }

    public set last_name(value: string) {
        this.change('last_name', value);
    }
    /** Timestamp the zone was created at, in ms since UTC epoch */
    public readonly created_at: number;
    /** Hash of the email address of the user */
    public readonly email_digest: string;
    /** ID of the authority associated with the user */
    private _authority_id: string;
    /** Email address of the user */
    private _email: string;
    /** Phone number of the user */
    private _phone: string;
    /** Country that the user resides in */
    private _country: string;
    /** Avatar image for the user */
    private _image: string;
    /** Additional metadata associated with the user */
    private _metadata: string;
    /** Username credential of the user */
    private _login_name: string;
    /** Organisation ID of the user */
    private _staff_id: string;
    /** First name of the user */
    private _first_name: string;
    /** Last name of the user */
    private _last_name: string;

    constructor(protected service: EngineUsersService, raw_data: HashMap) {
        super(service, raw_data);
        this.created_at = raw_data.created_at;
        this._authority_id = raw_data.authority_id;
        this._email = raw_data.email;
        this.email_digest = raw_data.email_digest;
        this._phone = raw_data.phone;
        this._country = raw_data.country;
        this._image = raw_data.image;
        this._metadata = raw_data.metadata;
        this._login_name = raw_data.login_name;
        this._staff_id = raw_data.staff_id;
        this._first_name = raw_data.first_name;
        this._last_name = raw_data.last_name;
    }
}
