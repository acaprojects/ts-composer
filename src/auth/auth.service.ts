import { BehaviorSubject, Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Md5 } from 'ts-md5/dist/md5';

import { generateNonce, getFragments, log, removeFragment } from '../utilities/general.utilities';
import { HashMap } from '../utilities/types.utilities';
import { EngineAuthOptions, EngineAuthority, EngineTokenResponse, MOCK_AUTHORITY } from './auth.interfaces';

import * as _dayjs from 'dayjs';
// tslint:disable-next-line:no-duplicate-imports
import { Dayjs, default as _rollupDayjs } from 'dayjs';
/**
 * @hidden
 */
const dayjs = _rollupDayjs || _dayjs;

/**
 * Method store to allow attaching spies for testing
 * @hidden
 */
export const engine = { ajax, log };

export class EngineAuthService {
    /** Browser key store to use for authentication credentials. Defaults to localStorage */
    private _storage: Storage = localStorage;
    /** Authentication authority of for the current domain */
    private _authority: EngineAuthority | undefined;
    /** Map of promises */
    private _promises: HashMap<Promise<any> | undefined> = {};
    /** OAuth 2 client ID for the application */
    private _client_id: string = '';
    /** OAuth 2 state property */
    private _state: string = '';
    /** OAuth 2 token generation code */
    private _code: string = '';
    /** Whether engine is online */
    private _online = new BehaviorSubject(false);
    /** Observer for the online state of engine */
    private _online_observer = this._online.asObservable();

    constructor(private options: EngineAuthOptions) {
        /* istanbul ignore else */
        if (options) {
            this.setup(options);
        }
    }

    public setup(options: EngineAuthOptions) {
        this.options = options;
        // Intialise storage
        this._storage = this.options.storage === 'session' ? sessionStorage : localStorage;
        this._client_id = Md5.hashStr(this.options.redirect_uri, false) as string;
        this.loadAuthority();
    }

    /** API Endpoint for the retrieved version of engine */
    public get api_endpoint() {
        const host = `${location.protocol}//${this.options.host || location.host}`;
        return `${host}${this.route}`;
    }

    /** Path of the API endpoint */
    public get route() {
        /* istanbul ignore else */
        if (this.authority) {
            /* istanbul ignore else */
            if (/[2-9]\.[0-9]+\.[0-9]+/g.test(this.authority.version || '')) {
                return `/api/engine/v2`;
            }
        }
        return `/control/api`;
    }

    /** OAuth 2 client ID for the application */
    public get client_id(): string {
        return this._client_id;
    }

    /** Redirect URI for the OAuth flow */
    public get redirect_uri(): string {
        return (this.options || {}).redirect_uri;
    }

    /** Bearer token for authenticating requests to engine */
    public get token(): string {
        if (this.options.mock) {
            return 'mock-token';
        }
        const expires_at = `${this._storage.getItem(`${this._client_id}_expires_at`)}`;
        if (dayjs(+expires_at).isBefore(dayjs(), 's')) {
            engine.log('Auth', 'Token expired. Requesting new token...');
            this.invalidateToken();
        }
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

    /** Engine Authority details */
    public get authority(): EngineAuthority | undefined {
        return this._authority;
    }

    /** Whether engine is online */
    public get is_online(): boolean {
        return this._online.getValue();
    }

    /** Observable for the online state of engine */
    public get online_state(): Observable<boolean> {
        return this._online_observer;
    }

    /** Whether this application is trusted */
    public get trusted(): boolean {
        const fragments = getFragments();
        let trusted = fragments.trust === 'true';
        /* istanbul ignore else */
        if (localStorage) {
            const key = `${this.client_id}_trusted`;
            trusted =
                trusted ||
                localStorage.getItem(key) === 'true' ||
                localStorage.getItem('trusted') === 'true';
            localStorage.setItem(key, `${trusted}`);
        }
        return trusted;
    }

    /** Whether this application is on a fixed location device */
    public get fixed_device(): boolean {
        const fragments = getFragments();
        let fixed_device = fragments.fixed_device === 'true';
        /* istanbul ignore else */
        if (localStorage) {
            const key = `${this.client_id}_fixed_device`;
            fixed_device =
                fixed_device ||
                localStorage.getItem(key) === 'true' ||
                localStorage.getItem('fixed_device') === 'true';
            localStorage.setItem(key, `${fixed_device}`);
        }
        return fixed_device;
    }

    /**
     * Refresh authentication
     */
    public refreshAuthority() {
        this._authority = undefined;
        this.loadAuthority();
    }

    /**
     * Invalidate the current access token
     */
    public invalidateToken() {
        this._storage.removeItem(`${this._client_id}_access_token`);
        this._storage.removeItem(`${this._client_id}_expires_at`);
    }

    /**
     * Check the users authentication credentials and perform actions required for the user to authenticate
     * @param state Additional state information for auth requests
     */
    public authorise(state?: string): Promise<string> {
        /* istanbul ignore else */
        if (!this._promises.authorise) {
            this._promises.authorise = new Promise<string>((resolve, reject) => {
                if (!this.authority) {
                    return reject('Authority is not loaded');
                }
                engine.log('Auth', 'Authorising user...');
                const authority = this._authority || {
                    session: false,
                    login_url: '/login?continue={{url}}'
                };
                const check_token = () => {
                    if (this.token) {
                        engine.log('Auth', 'Valid token found.');
                        delete this._promises.authorise;
                        resolve(this.token);
                    } else {
                        if (this._code || this.refresh_token) {
                            this.generateToken().then(
                                _ => {
                                    delete this._promises.authorise;
                                    resolve(this.token);
                                },
                                _ => {
                                    delete this._promises.authorise;
                                    reject(_);
                                }
                            );
                        } else {
                            if (authority.session) {
                                engine.log('Auth', 'Users has session. Authorising application...');
                                // Generate tokens
                                const login_url = this.createLoginURL(state);
                                /* istanbul ignore else */
                                if (localStorage) {
                                    localStorage.setItem('oauth_redirect', location.href);
                                }
                                setTimeout(() => window.location.assign(login_url), 300);
                                delete this._promises.authorise;
                            } else {
                                engine.log('Auth', 'No user session');
                                /* istanbul ignore else */
                                if (this.options.handle_login !== false) {
                                    engine.log('Auth', 'Redirecting to login page...');
                                    // Redirect to login form
                                    const url = authority.login_url.replace(
                                        '{{url}}',
                                        encodeURIComponent(location.href)
                                    );
                                    setTimeout(() => window.location.assign(url), 300);
                                    delete this._promises.authorise;
                                }
                            }
                            reject();
                        }
                    }
                };
                this.checkToken().then(check_token, check_token);
            });
        }
        return this._promises.authorise as Promise<string>;
    }

    /**
     * Logout and clear user credentials for the application
     */
    public logout() {
        const done = () => {
            // Remove user credentials
            for (let i = 0; i < this._storage.length; i++) {
                const key = this._storage.key(i);
                if (key && key.indexOf(this.client_id) >= 0) {
                    this._storage.removeItem(key);
                }
            }
            // Redirect user to logout URL
            const url = this.authority ? this.authority.logout_url : '/logout';
            setTimeout(() => window.location.assign(url), 300);
            this._online.next(false);
        };
        this.revokeToken().then(done, done);
    }

    /**
     * Load authority details from engine
     */
    private loadAuthority(tries: number = 0) {
        if (!this._promises.load_authority) {
            this._promises.load_authority = new Promise((resolve) => {
                this._online.next(false);
                if (this.options.mock) {
                    // Setup mock authority
                    this._authority = MOCK_AUTHORITY;
                    engine.log('Auth', `System in mock mode`);
                    this._online.next(true);
                    resolve();
                    return;
                }
                engine.log('Auth', `Fixed: ${this.fixed_device} | Trusted: ${this.trusted}`);
                engine.log('Auth', `Loading authority...`);
                let authority: EngineAuthority;
                engine.ajax.get('/auth/authority').subscribe(
                    resp =>
                        (authority =
                            resp.response && typeof resp.response === 'object' ? resp.response : null),
                    err => {
                        engine.log('Auth', `Failed to load authority(${err})`);
                        this._online.next(false);
                        delete this._promises.load_authority;
                        // Retry if authority fails to load
                        setTimeout(() => this.loadAuthority(tries).then(_ => resolve()), 300 * Math.min(20, ++tries));
                    },
                    () => {
                        if (authority) {
                            this._authority = authority;
                            const response = () => {
                                this._online.next(true);
                                setTimeout(() => delete this._promises.load_authority, 500);
                                resolve();
                            };
                            this.authorise('').then(response, response);
                        } else {
                            // Retry if authority fails to load
                            setTimeout(() => this.loadAuthority(tries).then(_ => resolve()), 300 * Math.min(20, ++tries));
                        }
                    }
                );
            });
        }
        return this._promises.load_authority;
    }

    /**
     * Check authentication token
     */
    private checkToken(): Promise<boolean> {
        /* istanbul ignore else */
        if (!this._promises.check_token) {
            this._promises.check_token = new Promise((resolve, reject) => {
                if (this.authority) {
                    if (this.token) {
                        engine.log('Auth', 'Valid token found.');
                        resolve(this.token);
                    } else {
                        engine.log('Auth', 'No token. Checking URL for auth credentials...');
                        this.checkForAuthParameters().then(_ => resolve(_), _ => reject(_));
                    }
                    this._promises.check_token = undefined;
                } else {
                    engine.log('Auth', 'Waiting for authority before checking token...');
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
        /* istanbul ignore else */
        if (!this._promises.check_params) {
            this._promises.check_params = new Promise((resolve, reject) => {
                let fragments = getFragments();
                if ((!fragments || Object.keys(fragments).length <= 0) && sessionStorage) {
                    fragments = JSON.parse(sessionStorage.getItem('ENGINE.auth.params') || '{}');
                }
                if (
                    fragments &&
                    (fragments.code || fragments.access_token || fragments.refresh_token)
                ) {
                    // Store authorisation code
                    if (fragments.code) {
                        this._code = fragments.code;
                        removeFragment('code');
                    }
                    // Store refresh token
                    if (fragments.refresh_token) {
                        this._storage.setItem(
                            `${this._client_id}_refresh_token`,
                            fragments.refresh_token
                        );
                        removeFragment('refresh_token');
                    }
                    const saved_nonce = this._storage.getItem(`${this._client_id}_nonce`) || '';
                    const state_parts = (fragments.state || '').split(';');
                    removeFragment('state');
                    removeFragment('token_type');
                    const nonce = state_parts[0];
                    /* istanbul ignore else */
                    if (saved_nonce === nonce) {
                        // Store access token
                        if (fragments.access_token) {
                            this._storage.setItem(
                                `${this._client_id}_access_token`,
                                fragments.access_token
                            );
                            removeFragment('access_token');
                        }
                        // Store token expiry time
                        if (fragments.expires_in) {
                            const expires_at = dayjs()
                                .add(parseInt(fragments.expires_in, 10), 's')
                                .startOf('s');
                            this._storage.setItem(
                                `${this._client_id}_expires_at`,
                                `${expires_at.valueOf()}`
                            );
                            removeFragment('expires_in');
                        }
                        // Store state
                        if (state_parts[1]) {
                            this._state = state_parts[1];
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
                delete this._promises.check_params;
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
        const has_query = this.options ? (this.options.auth_uri || '').indexOf('?') >= 0 : false;
        const login_url = (this.options ? this.options.auth_uri : null) || '/auth/oauth/authorize';
        const response_type = this.trusted ? 'code' : 'token';
        const url =
            `${login_url}${has_query ? '&' : '?'}` +
            `response_type=${encodeURIComponent(response_type)}` +
            `&client_id=${encodeURIComponent(this._client_id)}` +
            `&state=${encodeURIComponent(state)}` +
            `&redirect_uri=${encodeURIComponent(this.options.redirect_uri)}` +
            `&scope=${encodeURIComponent(this.options.scope)}`;

        return url;
    }

    /**
     * Generate token generation URL
     */
    private createRefreshURL(): string {
        const refresh_uri = this.options.token_uri || '/auth/token';
        let url = refresh_uri + `?client_id=${encodeURIComponent(this._client_id)}`;
        url += `&redirect_uri=${encodeURIComponent(this.options.redirect_uri)}`;
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
     * Revoke the current access token
     */
    private revokeToken(): Promise<void> {
        /* istanbul ignore else */
        if (!this._promises.revoke_token) {
            this._promises.revoke_token = new Promise<void>((resolve, reject) => {
                const token_uri = this.options.token_uri || '/auth/token';
                if (!this.has_token) {
                    resolve();
                    delete this._promises.revoke_token;
                } else {
                    engine.ajax.post(`${token_uri}?token=${this.token}`, '').subscribe(
                        null,
                        err => {
                            reject(err);
                            delete this._promises.revoke_token;
                        },
                        () => {
                            resolve();
                            delete this._promises.revoke_token;
                        }
                    );
                }
            });
        }
        return this._promises.revoke_token;
    }

    /**
     * Generate new tokens from a auth code or refresh token
     */
    private generateToken(): Promise<void> {
        /* istanbul ignore else */
        if (!this._promises.generate_tokens) {
            this._promises.generate_tokens = new Promise<void>((resolve, reject) => {
                const token_url = this.createRefreshURL();
                engine.log('Auth', 'Generating new token...');
                let tokens: EngineTokenResponse;
                engine.ajax.post(token_url, '').subscribe(
                    resp => {
                        tokens = resp.response;
                    },
                    err => {
                        engine.log('Auth', 'Error generating new tokens.', err);
                        reject();
                        delete this._promises.generate_tokens;
                    },
                    () => {
                        if (tokens) {
                            // Store access token
                            if (tokens.access_token) {
                                this._storage.setItem(
                                    `${this._client_id}_access_token`,
                                    tokens.access_token
                                );
                            }
                            // Store refresh token
                            if (tokens.refresh_token) {
                                this._storage.setItem(
                                    `${this._client_id}_refresh_token`,
                                    tokens.refresh_token
                                );
                            }
                            // Store token expiry time
                            if (tokens.expires_in) {
                                const expires_at = dayjs().add(
                                    parseInt(tokens.expires_in, 10),
                                    's'
                                );
                                this._storage.setItem(
                                    `${this._client_id}_expires_at`,
                                    `${expires_at.valueOf()}`
                                );
                            }
                            resolve();
                        }
                        delete this._promises.generate_tokens;
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
