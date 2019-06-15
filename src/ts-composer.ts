// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import 'core-js/es/promise'

import { EngineAuthService } from './auth/auth.service'
import { EngineHttpClient } from './http/http.service'
import { EngineBindingService } from './websocket/binding.service'
import { EngineWebsocket } from './websocket/webocket.class'

export interface ComposerOptions {}

export default class Composer {
    /** HTTP Client for request with composer credentials */
    private static _http: EngineHttpClient
    /** Authentication service for Composer */
    private static _auth_service: EngineAuthService
    /** Service for binding to engine's realtime API */
    private static _binding_service: EngineBindingService
    /** Websocket for engine realtime API communications */
    private static _websocket: EngineWebsocket

    constructor() {
        throw new Error('No new allow for static class')
    }

    /**
     * Initialise composer services
     * @param options
     */
    public static init(options: ComposerOptions) {}

    /** HTTP Client for making request with composer credentials */
    public static get http(): EngineHttpClient {
        if (!this._http) {
            throw new Error(
                "Composer hasn't been initialised yet. Call `Composer.init` to initialise composer"
            )
        }
        return this._http
    }

    /** Authentication service for Composer */
    public static get auth(): EngineAuthService {
        if (!this._auth_service) {
            throw new Error(
                "Composer hasn't been initialised yet. Call `Composer.init` to initialise composer"
            )
        }
        return this._auth_service
    }

    /** Service for binding to engine's realtime API */
    public static get bindings(): EngineBindingService {
        if (!this._binding_service) {
            throw new Error(
                "Composer hasn't been initialised yet. Call `Composer.init` to initialise composer"
            )
        }
        return this._binding_service
    }

    /** Interface for engine realtime API communications */
    public static get realtime(): EngineWebsocket {
        if (!this._websocket) {
            throw new Error(
                "Composer hasn't been initialised yet. Call `Composer.init` to initialise composer"
            )
        }
        return this._websocket
    }
}
