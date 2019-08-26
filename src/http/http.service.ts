import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { ajax, AjaxResponse, AjaxError } from 'rxjs/ajax'

import { log } from '../utilities/general.utilities'
import { HashMap } from '../utilities/types.utilities'
import { EngineAuthService } from '../auth/auth.service'
import {
    HttpJsonOptions,
    HttpTextOptions,
    HttpOptions,
    HttpResponse,
    HttpVoidOptions,
    HttpResponseType,
    HttpError,
    HttpVerb
} from './http.interfaces'

export const engine = {
    log,
    ajax
}

const REQUEST = {
    GET: ajax.get,
    PUT: ajax.put,
    PATCH: ajax.patch,
    POST: ajax.post,
    DELETE: ajax.delete
}

export class EngineHttpClient {
    constructor(protected _auth: EngineAuthService) {}

    /**
     *
     * @param url
     * @param options
     */
    public get(url: string, options?: HttpJsonOptions): Observable<HashMap>
    public get(url: string, options?: HttpTextOptions): Observable<string>
    public get(
        url: string,
        options: HttpOptions = { response_type: 'json' }
    ): Observable<HttpResponse> {
        return this.request('GET', url, options, options.response_type)
    }

    public post(url: string, body: any, options?: HttpJsonOptions): Observable<HashMap>
    public post(url: string, body: any, options?: HttpTextOptions): Observable<string>
    public post(
        url: string,
        body: any,
        options: HttpOptions = { response_type: 'json' }
    ): Observable<HttpResponse> {
        return this.request('POST', url, { body, ...options }, options.response_type)
    }

    public put(url: string, body: any, options?: HttpJsonOptions): Observable<HashMap>
    public put(url: string, body: any, options?: HttpTextOptions): Observable<string>
    public put(
        url: string,
        body: any,
        options: HttpOptions = { response_type: 'json' }
    ): Observable<HttpResponse> {
        return this.request('PUT', url, { body, ...options }, options.response_type)
    }

    public patch(url: string, body: any, options: HttpOptions): Observable<HttpResponse> {
        return this.request('PATCH', url, { body, ...options }, options.response_type || 'json')
    }

    public delete(url: string, options?: HttpJsonOptions): Observable<HashMap>
    public delete(url: string, options?: HttpTextOptions): Observable<string>
    public delete(url: string, options?: HttpVoidOptions): Observable<void>
    public delete(
        url: string,
        options: HttpOptions = { response_type: 'void' }
    ): Observable<HttpResponse> {
        return this.request('DELETE', url, options, options.response_type)
    }

    private transform(response: AjaxResponse, type: 'json'): HashMap
    private transform(response: AjaxResponse, type: 'text'): string
    private transform(response: AjaxResponse, type: 'void'): void
    private transform(response: AjaxResponse, type: HttpResponseType = 'json'): HttpResponse {
        switch (type) {
            case 'json':
                return JSON.parse(response.responseText)
            case 'text':
                return response.responseText
            case 'void':
                return
        }
    }

    private error(error: AjaxError): HttpError {
        return {
            status: error.status,
            message: error.message
        }
    }

    private request(
        method: HttpVerb,
        url: string,
        options: HttpOptions,
        type: HttpResponseType
    ): Observable<HttpResponse> {
        return new Observable<HttpResponse>(obs => {
            let ajax_obs: Observable<HttpResponse | HttpError>
            switch (method) {
                case 'GET':
                case 'DELETE':
                    ajax_obs = REQUEST[method](url, options.headers).pipe(
                        map(r => this.transform(r, options.response_type as any)),
                        catchError(e => of(this.error(e)))
                    )
                    break
                case 'PATCH':
                case 'PUT':
                case 'POST':
                    ajax_obs = REQUEST[method](url, options.body, options.headers).pipe(
                        // map(r => this.transform(r, options.response_type || 'json')),
                        catchError(e => of(this.error(e)))
                    )
                    break
            }
            ajax_obs!.subscribe(
                (data: HttpResponse) => obs.next(data),
                (e: HttpError) => obs.error(e),
                () => obs.complete()
            )
        })
    }
}
