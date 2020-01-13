import { HashMap } from '../utilities/types.utilities';

export const MOCK_AUTHORITY = {
    id: 'mock-authority',
    name: 'localhost:4200',
    description: '',
    dom: 'localhost:4200',
    login_url: `/login?continue={{url}}`,
    logout_url: `/logout`,
    session: true,
    production: false,
    config: {},
    version: `2.0.0`
};

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
    /** URL to the metrics interface for Engine */
    metrics?: string;
}

export interface EngineAuthOptions {
    /** Host name and port of the engine server */
    host?: string;
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
    /** Whether system is in mock mode */
    mock?: boolean;
}

export interface EngineTokenResponse {
    /** New access token */
    access_token: string;
    /** New refresh token */
    refresh_token: string;
    /** Time in seconds with which the token expires */
    expires_in: string;
}
