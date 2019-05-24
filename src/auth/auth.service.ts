
import { ajax } from './node_modules/rxjs/ajax';
import { Md5 } from './node_modules/ts-md5/dist/md5';

import { log, getFragments, generateNonce } from '../utilities/general.utilities';
import { EngineAuthority, EngineTokenResponse } from './auth.interfaces';
import { HashMap } from '../utilities/types.utilities';

import * as dayjs from './node_modules/dayjs';

export interface EngineAuthOptions {
    /** URI for generating new tokens */
    token_uri: string;
    /** URI for handling authentication redirects */
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

/** Method store to allow attaching spies for testing */
export const engine = { ajax, log };

/** Variable to hold the singleton of the auth service */
let SERVICE_SINGLETON: EngineAuthService;

/**
 * Grab existing engine auth service or create a new one with the given options
 * @param options Service configuration options
 */
export function getEngineAuthService(options?: EngineAuthOptions): EngineAuthService {
    if (!SERVICE_SINGLETON) {
        if (!options) {
            throw new Error('[Composer][Auth] Options for intialising service are not defined.');
        }
        SERVICE_SINGLETON = new EngineAuthService(options);
    }
    return SERVICE_SINGLETON;
}

export class EngineAuthService {
    /** Browser key store to use for authentication credentials. Defaults to localStorage */
    private _storage: Storage;
    /** Authentication authority of for the current domain */
    private _authority: EngineAuthority | undefined;
    /** Map of promises */
    private _promises: HashMap<Promise<any> | undefined> = {};
    /** OAuth 2 client ID for the application */
    private _client_id: string;
    /** OAuth 2 state property */
    private _state: string = '';
    /** OAuth 2 token generation code */
    private _code: string = '';

    constructor(private options: EngineAuthOptions) {
        // Prevent duplicate instances of the service
        if (SERVICE_SINGLETON) {
            throw new Error('[Composer][Auth] Service has already been created use `getEngineAuthService` method to get it.');
        }
        // Intialise storage
        this._storage = this.options.storage === 'session' ? sessionStorage : localStorage;
        this._client_id = Md5.hashStr(this.options.redirect_uri, false) as string;
        this.loadAuthority();
    }

    /** OAuth 2 client ID for the application */
    public get client_id(): string {
        return this._client_id;
    }

    /** Bearer token for authenticating requests to engine */
    public get token(): string {
        return this._storage.getItem(`${this._client_id}_access_token`) || '';
    }

    /** Refresh token for renewing the access token */
    public get refresh_token(): string {
        return this._storage.getItem(`${this._client_id}_refresh_token`) || '';
    }

    /** Whether the application has an authentication token */
    public get has_token(): boolean {
        return !!this.token;
    }

    /**
     * Refresh authentication
     */
    public refreshAuthority() {
        this._authority = undefined;
        this.loadAuthority();
    }

    /**
     * Check the users authentication credentials and perform actions required for the user to authenticate
     * @param state Additional state information for auth requests
     */
    public authorise(state?: string): Promise<string> {
        if (this._promises.authorise) {
            this._promises.authorise = new Promise<string>((resolve, reject) => {
                const check_token = () => {
                    if (this.token) {
                        resolve(this.token);
                    } else {
                        if (this._code || this.refresh_token) {
                            this.generateToken().then(_ => resolve(this.token), _ => reject(_));
                        } else {
                            const login_url = this.createLoginURL(state);
                            if (this.options.handle_login !== false) {
                                location.href = login_url;
                            }
                        }
                    }
                }
                this.checkToken().then(check_token, check_token);
            });
        }
        return this._promises.authorise as Promise<string>;
    }

    /**
     * Load authority details from engine
     */
    private loadAuthority(tries: number = 0) {
        engine.log('Auth', 'Loading authority...');
        let authority: EngineAuthority;
        engine.ajax('/auth/authority').subscribe(
            (resp) => authority = resp.response,
            (err) => {
                engine.log('Auth', `Failed to load authority(${err})`);
                // Retry if authority fails to load
                setTimeout(() => this.loadAuthority(tries), 300 * Math.min(20, ++tries));
            },
            () => {
                if (authority) {
                    this._authority = authority;
                    this.authorise();
                }
            }
        );
    }

    /**
     * Check authentication token
     */
    private checkToken(): Promise<boolean> {
        if (this._promises.check_token) {
            this._promises.check_token = new Promise((resolve, reject) => {
                if (this._authority) {
                    if (this.token) {
                        resolve();
                    } else {
                        this.checkForAuthParameters().then(_ => resolve(_), _ => reject(_));
                    }
                } else {
                    setTimeout(() => {
                        this._promises.check_token = undefined;
                        this.checkToken().then(_ => resolve(_), _ => reject(_));
                    }, 300);
                }
            });
        }
        return this._promises.check_token as Promise<boolean>;
    }

    /**
     * Check URL for auth parameters
     */
    private checkForAuthParameters(): Promise<boolean> {
        if (this._promises.check_params) {
            this._promises.check_params = new Promise((resolve, reject) => {
                let fragments = getFragments();
                if ((!fragments || Object.keys(fragments).length <= 0) && sessionStorage) {
                    fragments = JSON.parse(sessionStorage.getItem('ENGINE.auth.params') || '{}');
                }
                if (fragments && (fragments.code || fragments.access_token || fragments.refresh_token)) {
                    // Store authorisation code
                    if (fragments.code) {
                        this._code = fragments.code;
                    }
                    // Store refresh token
                    if (fragments.refresh_token) {
                        this._storage.setItem(`${this._client_id}_refresh_token`, fragments.refresh_token);
                    }
                    const saved_nonce = this._storage.getItem(`${this._client_id}_nonce`);
                    const state_parts = fragments.state.split(';');
                    const nonce = state_parts[0];
                    if (saved_nonce === nonce) {
                        // Store access token
                        if (fragments.access_token) {
                            this._storage.setItem(`${this._client_id}_access_token`, fragments.access_token);
                        }
                        // Store token expiry time
                        if (fragments.expires_in) {
                            const expires_at = dayjs().add(parseInt(fragments.expires_in, 10), 's');
                            this._storage.setItem(`${this._client_id}_expires_at`, `${expires_at.valueOf()}`);
                        }
                        // Store state
                        if (state_parts[1]) {
                            this._state = state_parts[1]
                        }
                        this._storage.removeItem('ENGINE.auth.redirect');
                        this._storage.setItem('ENGINE.auth.finished', 'true');
                        resolve(!!fragments.access_token);
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            });
        }
        return this._promises.check_params as Promise<boolean>;
    }

    /**
     * Generate login URL for the user to authenticate
     * @param state State information to send to the server
     */
    private createLoginURL(state?: string): string {
        const nonce = this.createAndSaveNonce();
        state = state ? `${nonce};${state}` : nonce;
        const has_query = this._authority ? this._authority.login_url.indexOf('?') >= 0 : false;
        const login_url = (this._authority ? this._authority.login_url : null) || '/login';
        const response_type = 'token';
        const url = `${login_url}${has_query ? '&' : '?'}`
            + `response_type=${encodeURIComponent(response_type)}`;
            + `client_id=${encodeURIComponent(this._client_id)}`;
            + `state=${encodeURIComponent(state)}`;
            + `redirect_uri=${encodeURIComponent(this.options.redirect_uri)}`;
            + `scope=${encodeURIComponent(this.options.scope)}`;

        return url;
    }

    /**
     * Generate token generation URL
     */
    private createRefreshURL(): string {
        let refresh_uri = this.options.token_uri || '/auth/token';
        let url = refresh_uri
            + `?client_id=${encodeURIComponent(this._client_id)}`;
            + `&redirect_uri=${encodeURIComponent(this.options.redirect_uri)}`;
        if (this.refresh_token) {
            url += `&refresh_token=${encodeURIComponent(this.refresh_token)}`;
            url += `&grant_type=refresh_token`;
        } else {
            url += `&code=${encodeURIComponent(this._code)}`;
            url += `&grant_type=authorization_code`;
        }
        return url;
    }

    /**
     * Generate new tokens from a auth code or refresh token
     */
    private generateToken(): Promise<void> {
        if (!this._promises.generate_tokens) {
            this._promises.generate_tokens = new Promise<void>((resolve, reject) => {
                const token_url = this.createRefreshURL();
                let tokens: EngineTokenResponse;
                engine.ajax({ url: token_url, method: 'POST' }).subscribe(
                    (resp) => { tokens = resp.response as EngineTokenResponse },
                    (err) => engine.log('Auth', 'Error generating new tokens.', err),
                    () => {
                        if (tokens) {
                            // Store access token
                            if (tokens.access_token) {
                                this._storage.setItem(`${this._client_id}_access_token`, tokens.access_token);
                            }
                            // Store refresh token
                            if (tokens.refresh_token) {
                                this._storage.setItem(`${this._client_id}_refresh_token`, tokens.refresh_token);
                            }
                            // Store token expiry time
                            if (tokens.expires_in) {
                                const expires_at = dayjs().add(parseInt(tokens.expires_in, 10), 's');
                                this._storage.setItem(`${this._client_id}_expires_at`, `${expires_at.valueOf()}`);
                            }
                        }
                    }
                );
            });
        }
        return this._promises.generate_tokens as Promise<void>;
    }

    /**
     * Create nonce and save it to the set key store
     */
    private createAndSaveNonce(): string {
        const nonce = generateNonce();
        this._storage.setItem(`${this._client_id}_nonce`, nonce);
        return nonce;
    }

}