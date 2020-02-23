import { BehaviorSubject, Observable, Subject, Subscriber } from 'rxjs';

import { toQueryString } from '../../../utilities/api.utilities';
import { EngineBaseClass } from '../../../utilities/base.class';
import { HashMap } from '../../../utilities/types.utilities';
import { HttpError } from '../../http.interfaces';
import { EngineHttpClient } from '../../http.service';
import { EngineResource } from './resource.class';
import { ResourceService } from './resources.interface';

export abstract class EngineResourceService<T extends EngineResource<any>> extends EngineBaseClass
    implements ResourceService<T> {
    /** Whether service has been initialised */
    public get initialised() {
        return this._initialised;
    }

    /** API Route of the service */
    public get api_route() {
        return `${this.http.api_endpoint}/${this._api_route}`;
    }

    /** Total number of items returned by the last basic index query */
    public get total(): number {
        return this._total;
    }

    /** Total number of items returned by the last basic index query */
    public get last_total(): number {
        return this._last_total;
    }
    /** Display name of the service */
    protected _name: string;
    /** API Route of the service */
    protected _api_route: string;
    /** Map of state variables for Service */
    protected _subjects: { [key: string]: BehaviorSubject<any> | Subject<any> } = {};
    /** Map of observables for state variables */
    protected _observers: { [key: string]: Observable<any> } = {};
    /** Map of poll subscribers for API endpoints */
    protected _subscribers: { [key: string]: Subscriber<any> } = {};
    /** Map of promises for Service */
    protected _promises: { [key: string]: Promise<any> } = {};
    /** Whether the service has initialised or not */
    protected _initialised: boolean = false;
    /** Total number of items returned by the last basic index query */
    protected _total: number = 0;
    /** Total number of items returned by the last index query */
    protected _last_total: number = 0;

    constructor(protected http: EngineHttpClient) {
        super();
        this._name = 'Base';
        this._api_route = 'base';
        this._initialised = true;
    }

    /**
     * Query the index of the API route associated with this service
     * @param query_params Map of query paramaters to add to the request URL
     */
    public query(query_params: HashMap = {}): Promise<T[]> {
        let cache = 1000;
        /* istanbul ignore else */
        if (query_params && query_params.cache) {
            cache = query_params.cache;
            delete query_params.cache;
        }
        const query = toQueryString(query_params);
        const key = `query|${query}`;
        /* istanbul ignore else */
        if (!this._promises[key]) {
            this._promises[key] = new Promise((resolve, reject) => {
                const url = `${this.api_route}${query ? '?' + query : ''}`;
                let result: T[] | HashMap[] = [];
                this.http.get(url).subscribe(
                    (d: HashMap) => {
                        result =
                            d && d instanceof Array
                                ? d.map(i => this.process(i))
                                : d && !(d instanceof Array) && d.results
                                    ? (d.results as HashMap[]).map(i => this.process(i))
                                    : [];
                        if (d.total) {
                            query.length < 2 || query.length < 12 && query.indexOf('offset=') >= 0
                                ? this._total = d.total
                                : this._last_total = d.total;
                        }
                    },
                    (e: any) => {
                        reject(e);
                        this.timeout(key, () => delete this._promises[key], 1);
                    },
                    () => {
                        resolve(result);
                        this.timeout(key, () => delete this._promises[key], cache);
                    }
                );
            });
        }
        return this._promises[key];
    }

    /**
     * Query the API route for a sepecific item
     * @param id ID of the item
     * @param query_params Map of query paramaters to add to the request URL
     */
    public show(id: string, query_params: HashMap = {}): Promise<T> {
        const query = toQueryString(query_params);
        const key = `show|${id}|${query}`;
        /* istanbul ignore else */
        if (!this._promises[key]) {
            this._promises[key] = new Promise<T>((resolve, reject) => {
                const url = `${this.api_route}/${id}${query ? '?' + query : ''}`;
                let result: T;
                this.http.get(url).subscribe(
                    (d: HashMap) => (result = this.process(d)),
                    (e: HttpError) => {
                        reject(e);
                        delete this._promises[key];
                    },
                    () => {
                        resolve(result);
                        this.timeout(key, () => delete this._promises[key], 1000);
                    }
                );
            });
        }
        return this._promises[key];
    }

    /**
     * Make post request for a new item to the service
     * @param form_data Data to post to the server
     * @param query_params Map of query paramaters to add to the request URL
     */
    public add(form_data: HashMap, query_params: HashMap = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const query = toQueryString(query_params);
            const url = `${this.api_route}${query ? '?' + query : ''}`;
            let result: T;
            this.http.post(url, form_data).subscribe(
                (d: HashMap) => {
                    result = this.process(d);
                },
                (e: HttpError) => {
                    this._promises.new_item = null as any;
                    reject(e);
                },
                () => {
                    this._promises.new_item = null as any;
                    resolve(result);
                }
            );
        });
    }

    /**
     * Perform API task for the given item ID
     * @param id ID of the item
     * @param task_name Name of the task
     * @param form_data Map of data to pass to the API
     * @param method Verb to use for request
     */
    public task<U = any>(
        id: string,
        task_name: string,
        form_data: HashMap = {},
        method: 'post' | 'get' = 'post'
    ): Promise<U> {
        const query = toQueryString(form_data);
        const key = `task|${id}|${task_name}|${query}`;
        /* istanbul ignore else */
        if (!this._promises[key]) {
            this._promises[key] = new Promise<U>((resolve, reject) => {
                const post_data = { ...form_data, id, _task: task_name };
                const url = `${this.api_route}/${id}/${task_name}`;
                let result: any;
                const request =
                    method === 'post'
                        ? this.http.post(url, post_data)
                        : this.http.get(`${url}${query ? '?' + query : ''}`);
                request.subscribe(
                    d => (result = d),
                    e => {
                        reject(e);
                        delete this._promises[key];
                    },
                    () => {
                        resolve(result as U);
                        this.timeout(key, () => delete this._promises[key], 1000);
                    }
                );
            });
        }
        return this._promises[key];
    }

    /**
     * Setup a poller for an index or show API endpoint
     * @param id Show request ID. Leave blank to poll on the query endpoint
     * @param query_params Map of query paramaters to add to the polled URL
     * @param delay Delay between each poll event. Defaults to `5000` ms
     */
    public poll(id?: string, query_params: HashMap = {}, delay: number = 5000): Observable<T | T[]> {
        const key = `poll|${id || ''}|${toQueryString(query_params || {}) || ''}`;
        this.stopPoll(id, query_params);
        this._subjects[key] = new Subject<T | T[]>();
        this._observers[key] = this._subjects[key].asObservable();
        const sub = this._subjects[key];
        const query = { ...(query_params || {}), _poll: true };
        if (id) {
            this.show(id, query).then(d => sub.next(d), e => sub.error(e));
            this.interval(
                key,
                () => {
                    this.show(id, query).then(d => sub.next(d), e => sub.error(e));
                },
                delay
            );
        } else {
            this.query(query).then((d: T[]) => sub.next(d), (e: any) => sub.error(e));
            this.interval(
                key,
                () => {
                    this.query(query).then(d => sub.next(d), e => sub.error(e));
                },
                delay
            );
        }
        return this._observers[key];
    }

    /**
     * Destroy poller
     * @param id ID used for poll creation
     * @param query_params Map of query parameters used for poll creation
     */
    public stopPoll(id?: string, query_params: HashMap = {}) {
        const key = `poll|${id || ''}|${toQueryString(query_params) || ''}`;
        /* istanbul ignore else */
        if (this._subjects[key]) {
            this._subjects[key].complete();
            delete this._subjects[key];
            delete this._observers[key];
        }
    }

    /**
     * Make put request for changes to the item with the given id
     * @param id ID of the item being updated
     * @param form_data New values for the item
     * @param query_params Map of query paramaters to add to the request URL
     */
    public update(id: string, form_data: HashMap, query_params: HashMap = {}, type: 'put' | 'patch' = 'patch'): Promise<T> {
        const key = `update|${id}`;
        /* istanbul ignore else */
        if (!this._promises[key]) {
            this._promises[key] = new Promise<T>((resolve, reject) => {
                const query = toQueryString(query_params);
                const url = `${this.api_route}/${id}${query ? '?' + query : ''}`;
                let result: T;
                this.http[type](url, form_data).subscribe(
                    (d: HashMap) => (result = this.process(d)),
                    (e: HttpError) => {
                        reject(e);
                        delete this._promises[key];
                    },
                    () => {
                        resolve(result);
                        this.timeout(key, () => delete this._promises[key], 10);
                    }
                );
            });
        }
        return this._promises[key];
    }

    /**
     * Make delete request for the given item
     * @param id ID of item
     */
    public delete(id: string, query_params: HashMap = {}): Promise<void> {
        const query = toQueryString(query_params);
        const key = `delete|${id}|${query}`;
        /* istanbul ignore else */
        if (!this._promises[key]) {
            this._promises[key] = new Promise<void>((resolve, reject) => {
                const url = `${this.api_route}/${id}${query ? '?' + query : ''}`;
                this.http.delete(url).subscribe(
                    _ => null,
                    (e: HttpError) => {
                        reject(e);
                        delete this._promises[key];
                    },
                    () => {
                        resolve();
                        this.timeout(key, () => delete this._promises[key], 10);
                    }
                );
            });
        }
        return this._promises[key];
    }

    /**
     * Convert raw API data into a valid API Object
     * @param raw_item Raw API data
     */
    protected process(raw_item: HashMap): T {
        return raw_item as T;
    }
}
