import { HashMap } from './types.utilities';

declare global {
    interface Window {
        debug: boolean;
    }
}
/**
 * @hidden
 */
export type ConsoleIOStream = 'log' | 'warn' | 'debug' | 'error';
/* istanbul ignore next */
/**
 * Log message to the console
 * @hidden
 * @param type Where the message is from
 * @param msg Body of the message
 * @param args Javascript data to post after the message
 * @param out IO stream to post message to
 * @param color CSS colour to set the `type` value printed to the console
 */
export function log(
    type: string,
    msg: string,
    args?: any,
    out: ConsoleIOStream = 'debug',
    color?: string
) {
    if (window.debug) {
        const clr = color ? color : '#009688';
        const COLOURS = ['color: #0288D1', `color:${clr}`, 'color: default'];
        if (args) {
            if (consoleHasColours()) {
                console[out](`%c[COMPOSER]%c[${type}] %c${msg}`, ...COLOURS, args);
            } else {
                console[out](`[COMPOSER][${type}] ${msg}`, args);
            }
        } else {
            if (consoleHasColours()) {
                console[out](`%c[COMPOSER]%c[${type}] %c${msg}`, ...COLOURS);
            } else {
                console[out](`[COMPOSER][${type}] ${msg}`);
            }
        }
    }
}
/* istanbul ignore next */
/**
 * Whether the console has colours
 * @hidden
 */
export function consoleHasColours() {
    const doc = document as any;
    return !(doc.documentMode || /Edge/.test(navigator.userAgent));
}

/**
 * Get URL paramters from hash or query string
 */
export function getFragments(): HashMap<string> {
    const hash = location.hash ? location.hash.slice(1) : '';
    let query = location.search ? location.search.slice(1) : '';
    let hash_fragments = {};
    if (hash) {
        // Hash can also contain the query so we need to check for it
        if (hash.indexOf('?') >= 0) {
            const parts = hash.split('?');
            hash_fragments = convertPairStringToMap(parts[0]);
            /* istanbul ignore else */
            if (!query) {
                query = parts[1];
            }
        } else {
            hash_fragments = convertPairStringToMap(hash);
        }
    }
    let query_fragments = {};
    if (query) {
        query_fragments = convertPairStringToMap(query);
    }
    return { ...hash_fragments, ...query_fragments };
}

/**
 * Convert string of key value pairs to a dictionary object
 * @param str String of values
 */
export function convertPairStringToMap(str: string): HashMap<string> {
    const map: HashMap<string> = {};
    const str_pairs = str.split('&');
    for (const str_pair of str_pairs) {
        const split_pair = str_pair.split('=');
        if (split_pair[1]) {
            map[decodeURIComponent(split_pair[0])] = decodeURIComponent(split_pair[1]);
        }
    }
    return map;
}

/**
 * Create a nonce with the given length
 * @param length Length of the nonce string. Defaults to 40 characters
 */
export function generateNonce(length: number = 40): string {
    const allowed_characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
        nonce += allowed_characters.charAt(Math.floor(Math.random() * allowed_characters.length));
    }
    return nonce;
}

/**
 * Replace the URL fragment with the given name
 * @param name Name of the fragment to remove
 */
export function removeFragment(name: string) {
    const new_hash = (location.hash || '')
        .replace(new RegExp(`${name}[a-zA-Z0-9\%\=]*&?`, 'g'), '')
        .replace(/&&/g, '&')
        .replace(/#&/g, '#');
    const new_search = (location.search || '')
        .replace(new RegExp(`${name}[a-zA-Z0-9\%\=]*&?`, 'g'), '')
        .replace(/&&/g, '&')
        .replace(/\?&/g, '#');
    window.history.replaceState(null, '', `${location.pathname}${new_hash}${new_search}`);
}
