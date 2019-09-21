import { HashMap } from '../utilities/types.utilities';

/** HTTP request verb. Can be one of either `GET`, `POST`, `PUT`, `PATCH`, or `DELETE` */
export type HttpVerb = `GET` | `POST` | `PUT` | `PATCH` | `DELETE`;

export type HttpResponseType = 'json' | 'text' | 'void';

export type HttpResponse = HashMap | string | void;

export interface HttpOptions {
    headers?: HashMap<string>;
    body?: any;
    response_type?: HttpResponseType;
}

export interface HttpJsonOptions extends HttpOptions {
    response_type?: 'json';
}

export interface HttpTextOptions extends HttpOptions {
    response_type?: 'text';
}

export interface HttpVoidOptions extends HttpOptions {
    response_type?: 'void';
}

export enum HttpStatusCode {
    UNAUTHORISED = 401
}

export interface HttpError {
    status: HttpStatusCode;
    message: string;
}
