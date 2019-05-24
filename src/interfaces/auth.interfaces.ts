
import { HashMap } from "../utilities/types.utilities";

export interface EngineAuthority {
    /** Engine ID for the Authority */
    id: string;
    /** Authority name */
    name: string;
    /** Description of the authority site */
    description: string;
    /** Domain of the authority */
    dom: string;
    /** URL for user to login for authentication */
    login_url: string;
    /** URL for user to clear authentication details */
    logout_url: string;
    /** Whether the engine instance is a production build */
    production: boolean;
    /** Whether the user has an authentication session */
    session: boolean;
    /** Configuration metadata for the authority */
    config: HashMap;
}

export interface EngineTokenResponse {
    /** New access token */
    access_token: string;
    /** New refresh token */
    refresh_token: string;
    /** Time in seconds with which the token expires */
    expires_in: string;
}
