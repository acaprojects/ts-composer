declare global {
    interface Window {
        debug: boolean;
    }
}

export type ConsoleIOStream = 'log' | 'warn' | 'debug' | 'error';

/**
 * Log message to the console
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
    color?: string,
) {
    if (window.debug) {
        const clr = color ? color : '#009688';
        const COLOURS = ['color: #0288D1', `color:${clr}`, 'color:rgba(0,0,0,0.87)'];
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

/**
 * Whether the console has colours
 */
export function consoleHasColours() {
    const doc = document as any;
    return !(doc.documentMode || /Edge/.test(navigator.userAgent));
}
