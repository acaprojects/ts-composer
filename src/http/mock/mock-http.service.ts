import { from, Observable, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';

import { engine, EngineAuthService } from '../../auth/auth.service';
import { convertPairStringToMap, log } from '../../utilities/general.utilities';
import { HashMap } from '../../utilities/types.utilities';
import {
    HttpJsonOptions,
    HttpOptions,
    HttpResponse,
    HttpTextOptions,
    HttpVerb,
    HttpVoidOptions
} from '../http.interfaces';
import { EngineHttpClient } from '../http.service';
import {
    MockHttpRequest,
    MockHttpRequestHandler,
    MockHttpRequestHandlerOptions
} from './mock-http.interfaces';

declare global {
    interface Window {
        control: any;
    }
}

/* istanbul ignore else */
if (!window.control) {
    window.control = {};
}

export class MockEngineHttpClient extends EngineHttpClient {
    /** Mapping of handlers for http requests */
    private _handlers: HashMap<MockHttpRequestHandler> = {};

    constructor(protected _auth: EngineAuthService) {
        super(_auth);
        // Register global space mock request handlers
        /* istanbul ignore else */
        if (window.control && window.control.handlers) {
            const handlers: MockHttpRequestHandlerOptions[] = window.control.handlers || [];
            for (const handler of handlers) {
                this.register(handler.path, handler.metadata, handler.method, handler.callback);
            }
        }
    }

    /**
     * Register handler for http endpoint
     * @param path URL to be handled
     * @param data Data associated with the results of the endpoint
     * @param method HTTP Verb to listen to
     * @param callback Callback for handling request to the given endpoint
     */
    public register<T>(
        path: string,
        data: any,
        method: HttpVerb = 'GET',
        callback?: (handler: MockHttpRequest<T>) => any
    ) {
        const key = `${method}|${path}`;
        if (this._handlers[key]) {
            delete this._handlers[key];
            log('HTTP(M)', `- ${method} ${path}`);
        }
        const path_parts = path
            .replace(/(http|https):\/\/[a-zA-Z0-9.]*:?([0-9]*)?/g, '') // Remove URL origin
            .replace(/^\//, '')
            .split('/');
        const handler: MockHttpRequestHandler<T> = {
            path,
            method,
            metadata: data,
            callback: callback || (a => a.metadata),
            path_parts,
            path_structure: path_parts.map(i => (i[0] === ':' ? i.replace(':', '') : ''))
        };
        this._handlers[key] = handler;
        log('HTTP(M)', `+ ${method} ${path}`);
    }

    public get(url: string, options?: HttpJsonOptions): Observable<HashMap>;
    public get(url: string, options?: HttpTextOptions): Observable<string>;
    public get(url: string, options?: HttpOptions): Observable<HttpResponse> {
        const handler = this.findRequestHandler('GET', url);
        engine.log('HTTP(M)', `GET ${url}`, options);
        if (handler) {
            const request = this.processRequest(url, handler);
            return this.mock_request(handler, request);
        }
        return super.get(url, options as any);
    }

    public post(url: string, body: any, options?: HttpJsonOptions): Observable<HashMap>;
    public post(url: string, body: any, options?: HttpTextOptions): Observable<string>;
    public post(url: string, body: any, options?: HttpOptions): Observable<HttpResponse> {
        const handler = this.findRequestHandler('POST', url);
        engine.log('HTTP(M)', `POST ${url}`, [body, options]);
        if (handler) {
            const request = this.processRequest(url, handler, body);
            return this.mock_request(handler, request);
        }
        return super.post(url, body, options as any);
    }

    public put(url: string, body: any, options?: HttpJsonOptions): Observable<HashMap>;
    public put(url: string, body: any, options?: HttpTextOptions): Observable<string>;
    public put(url: string, body: any, options?: HttpOptions): Observable<HttpResponse> {
        const handler = this.findRequestHandler('PUT', url);
        engine.log('HTTP(M)', `PUT ${url}`, [body, options]);
        if (handler) {
            const request = this.processRequest(url, handler, body);
            return this.mock_request(handler, request);
        }
        return super.put(url, body, options as any);
    }

    public patch(url: string, body: any, options?: HttpJsonOptions): Observable<HashMap>;
    public patch(url: string, body: any, options?: HttpTextOptions): Observable<string>;
    public patch(url: string, body: any, options?: HttpOptions): Observable<HttpResponse> {
        const handler = this.findRequestHandler('PATCH', url);
        engine.log('HTTP(M)', `PATCH ${url}`, [body, options]);
        if (handler) {
            const request = this.processRequest(url, handler, body);
            return this.mock_request(handler, request);
        }
        return super.patch(url, body, options as any);
    }

    public delete(url: string, options?: HttpJsonOptions): Observable<HashMap>;
    public delete(url: string, options?: HttpTextOptions): Observable<string>;
    public delete(url: string, options?: HttpVoidOptions): Observable<void>;
    public delete(url: string, options?: HttpOptions): Observable<HttpResponse> {
        const handler = this.findRequestHandler('DELETE', url);
        engine.log('HTTP(M)', `DELETE ${url}`, options);
        if (handler) {
            const request = this.processRequest(url, handler);
            return this.mock_request(handler, request);
        }
        return super.delete(url, options as any);
    }

    /**
     * Find a request handler for the given URL and method
     * @param method HTTP verb for the request
     * @param url URL of the request
     */
    public findRequestHandler(method: HttpVerb, url: string): MockHttpRequestHandler | null {
        const path = url.replace(/(http|https)?:\/\/[a-zA-Z0-9.]*:?([0-9]*)?/g, '').replace(/^\//, '').split('?')[0];
        const route_parts = path.split('/');
        const method_handlers: MockHttpRequestHandler[] = Object.keys(this._handlers).reduce<
            MockHttpRequestHandler[]
        >((l, i) => {
            if (i.indexOf(`${method}|`) === 0) {
                l.push(this._handlers[i]);
            }
            return l;
        }, []);
        for (const handler of method_handlers) {
            if (handler.path_structure.length === route_parts.length) {
                // Path lengths match
                let match = true;
                for (let i = 0; i < handler.path_structure.length; i++) {
                    if (!handler.path_structure[i] && handler.path_parts[i] !== route_parts[i]) {
                        // Static path fragments don't match
                        match = false;
                        break;
                    }
                }
                if (match) {
                    return handler;
                }
            }
        }
        return null;
    }

    /**
     * Generate mock HTTP request from the given URL and handler
     * @param url URL to mock
     * @param handler Handler for the given URL
     */
    private processRequest<T = any>(
        url: string,
        handler: MockHttpRequestHandler<T>,
        body?: any
    ): MockHttpRequest<T> {
        const parts = url.replace(/(http|https):\/\/[a-zA-Z0-9.]*:?([0-9]*)?/g, '').split('?');
        const path = parts[0].replace(/^\//g, '');
        const query = parts[1] || '';
        const query_params = convertPairStringToMap(query);
        // Grab route parameters from URL
        const route_parts = path.split('/');
        const route_params: HashMap = {};
        for (const part of handler.path_structure) {
            if (part) {
                route_params[part] = route_parts[handler.path_structure.indexOf(part)];
            }
        }
        const request = {
            url,
            path: handler.path,
            method: handler.method,
            metadata: handler.metadata,
            route_params,
            query_params,
            body
        };
        engine.log('HTTP(M)', `MATCHED ${request.method}:`, request);
        return request;
    }

    /**
     * Perform request and return an observable for the generated response
     * @param handler Request handler
     * @param request Request contents
     */
    private mock_request(handler: MockHttpRequestHandler, request: MockHttpRequest) {
        const result = handler.callback(request);
        return from([result]).pipe(
            concatMap(item => of(item).pipe(delay(Math.floor(Math.random() * 300 + 50))))
        );
    }
}
