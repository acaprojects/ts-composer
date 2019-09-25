import { HashMap } from '../utilities/types.utilities';

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
    /** Version of the ACAEngine API */
    version?: string;
}

export interface EngineAuthOptions {
    /** URI for authorizing the user */
    auth_uri: string;
    /** URI for generating new tokens */
    token_uri: string;
    /** URI for handling authentication redirects. e.g. `/assets/oauth-resp.html` */
    redirect_uri: string;
    /** Scope of the user permissions needed to access the application  */
    scope: string;
    /** Which keystore to use localStorage or sessionStorage. Defaults to `'local'' */
    storage?: 'local' | 'session';
    /** Whether to perform authentication in an iframe */
    use_iframe?: boolean;
    /** Whether service should handling user login. Defaults to `true` */
    handle_login?: boolean;
}

export interface EngineTokenResponse {
    /** New access token */
    access_token: string;
    /** New refresh token */
    refresh_token: string;
    /** Time in seconds with which the token expires */
    expires_in: string;
}
