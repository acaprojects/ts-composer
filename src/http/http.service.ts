import { Observable, of, throwError } from 'rxjs';
import { ajax, AjaxError, AjaxResponse } from 'rxjs/ajax';
import { catchError, map } from 'rxjs/operators';

import { EngineAuthService } from '../auth/auth.service';
import { log } from '../utilities/general.utilities';
import { HashMap } from '../utilities/types.utilities';
import {
    HttpError,
    HttpJsonOptions,
    HttpOptions,
    HttpResponse,
    HttpResponseType,
    HttpStatusCode,
    HttpTextOptions,
    HttpVerb,
    HttpVoidOptions
} from './http.interfaces';

/**
 * Method store to allow attaching spies for testing
 * @hidden
 */
export const engine_http: any = {
    ajax,
    log
};

export class EngineHttpClient {
    constructor(protected _auth: EngineAuthService) {}

    /** API Endpoint for the retrieved version of engine */
    public get api_endpoint() {
        return this._auth.api_endpoint;
    }

    /**
     * Perform AJAX HTTP GET request
     * @param url URL of the GET endpoint
     * @param options Options to add to the request
     */
    public get(url: string, options?: HttpJsonOptions): Observable<HashMap>;
    public get(url: string, options?: HttpTextOptions): Observable<string>;
    public get(url: string, options?: HttpOptions): Observable<HttpResponse> {
        if (!options) {
            options = { response_type: 'json' };
        }
        if (!this._auth.has_token) {
            this._auth.refreshAuthority();
        }
        return this.request('GET', url, { response_type: 'json', ...options });
    }

    /**
     * Perform AJAX HTTP POST request
     * @param url URL of the POST endpoint
     * @param body Body contents of the request
     * @param options Options to add to the request
     */
    public post(url: string, body: any, options?: HttpJsonOptions): Observable<HashMap>;
    public post(url: string, body: any, options?: HttpTextOptions): Observable<string>;
    public post(url: string, body: any, options?: HttpOptions): Observable<HttpResponse> {
        if (!options) {
            options = { response_type: 'json' };
        }
        if (this._auth.has_token) {
            this._auth.refreshAuthority();
        }
        return this.request('POST', url, { body, response_type: 'json', ...options });
    }

    /**
     * Perform AJAX HTTP PUT request
     * @param url URL of the PUT endpoint
     * @param body Body contents of the request
     * @param options Options to add to the request
     */
    public put(url: string, body: any, options?: HttpJsonOptions): Observable<HashMap>;
    public put(url: string, body: any, options?: HttpTextOptions): Observable<string>;
    public put(url: string, body: any, options?: HttpOptions): Observable<HttpResponse> {
        if (!options) {
            options = { response_type: 'json' };
        }
        if (this._auth.has_token) {
            this._auth.refreshAuthority();
        }
        return this.request('PUT', url, { body, response_type: 'json', ...options });
    }

    /**
     * Perform AJAX HTTP PATCH request
     * @param url URL of the PATCH endpoint
     * @param body Body contents of the request
     * @param options Options to add to the request
     */
    public patch(url: string, body: any, options?: HttpJsonOptions): Observable<HashMap>;
    public patch(url: string, body: any, options?: HttpTextOptions): Observable<string>;
    public patch(url: string, body: any, options?: HttpOptions): Observable<HttpResponse> {
        if (!options) {
            options = { response_type: 'json' };
        }
        if (this._auth.has_token) {
            this._auth.refreshAuthority();
        }
        return this.request('PATCH', url, { body, response_type: 'json', ...options });
    }

    /**
     * Perform AJAX HTTP DELETE request
     * @param url URL of the DELETE endpoint
     * @param options Options to add to the request
     */
    public delete(url: string, options?: HttpJsonOptions): Observable<HashMap>;
    public delete(url: string, options?: HttpTextOptions): Observable<string>;
    public delete(url: string, options?: HttpVoidOptions): Observable<void>;
    public delete(url: string, options?: HttpOptions): Observable<HttpResponse> {
        if (!options) {
            options = { response_type: 'void' };
        }
        if (this._auth.has_token) {
            this._auth.refreshAuthority();
        }
        return this.request('DELETE', url, { response_type: 'void', ...options });
    }

    /**
     * Convert response into the format requested
     * @param response Request response contents
     * @param type Type of data to return
     */
    private transform(resp: AjaxResponse, type: 'json'): HashMap;
    private transform(resp: AjaxResponse, type: 'text'): string;
    private transform(resp: AjaxResponse, type: 'void'): void;
    private transform(resp: AjaxResponse, type: HttpResponseType): HttpResponse {
        const text = resp.response;
        switch (type) {
            case 'json':
                return typeof text === 'string' ? JSON.parse(text || '{}') : text;
            case 'text':
                return typeof text === 'string' ? text : (typeof text === 'object' ? JSON.stringify(text) : `${text}`);
            case 'void':
                return;
        }
    }

    /**
     * Format error message
     * @param error Message to format
     */
    private error(error: AjaxError): HttpError {
        if (error.status === HttpStatusCode.UNAUTHORISED) {
            this._auth.refreshAuthority();
        }
        return {
            status: error.status,
            message: error.message
        };
    }

    /**
     * Perform AJAX Request
     * @param method Request verb. `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`
     * @param url URL of the request endpoint
     * @param options Options to add to the request
     */
    private request(method: HttpVerb, url: string, options: HttpOptions): Observable<HttpResponse> {
        return new Observable<HttpResponse>(obs => {
            let ajax_obs: Observable<HttpResponse | HttpError>;
            // Add auth header to request
            if (!options.headers) {
                options.headers = {};
            }
            options.headers.Authorization = `Bearer ${this._auth.token}`;
            const verb = method.toLowerCase();
            switch (method) {
                case 'GET':
                case 'DELETE':
                    ajax_obs = engine_http.ajax[verb](url, options.headers).pipe(
                        map((r: AjaxResponse) => this.transform(r, options.response_type as any)),
                        catchError(e => throwError(this.error(e)))
                    );
                    break;
                case 'PATCH':
                case 'PUT':
                case 'POST':
                    if (!options.headers['Content-Type']) {
                        options.headers['Content-Type'] = 'application/json';
                    }
                    ajax_obs = engine_http.ajax[verb](url, options.body, options.headers).pipe(
                        map((r: AjaxResponse) => this.transform(r, options.response_type as any)),
                        catchError(e => throwError(this.error(e)))
                    );
                    break;
            }
            ajax_obs!.subscribe(
                (data: HttpResponse) => obs.next(data),
                (e: HttpError) => obs.error(e),
                () => obs.complete()
            );
        });
    }
}
