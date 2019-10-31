import {
    generateNonce,
    convertPairStringToMap,
    getFragments
} from '../../src/utilities/general.utilities';

describe('General Utilities', () => {
    beforeEach(() => {
        window.history.pushState({}, 'Empty', '');
    });

    describe('generateNonce', () => {
        it('should generate nonce', () => {
            let nonce = generateNonce();
            expect(typeof nonce).toBe('string');
            expect(nonce.length).toBe(40);
            const old_nonce = nonce;
            nonce = generateNonce(60);
            expect(nonce.length).toBe(60);
            expect(/[A-Za-z0-9]*/g.test(nonce)).toBeTruthy();
            nonce = generateNonce();
            expect(nonce).not.toBe(old_nonce);
        });
    });

    describe('convertPairStringToMap', () => {
        it('should covert string pairs into a dictionary', () => {
            expect(convertPairStringToMap('test=false')).toEqual({ test: `false` });
            expect(convertPairStringToMap('test=false&other=value')).toEqual({
                test: `false`,
                other: `value`
            });
        });
    });

    describe('getFragments', () => {
        it('should convert URL hash into into a dictionary', () => {
            window.history.pushState({}, 'Test', `#test=false`);
            expect(getFragments()).toEqual({ test: `false` });
            window.history.pushState({}, 'Test', `#test=false&other=value`);
            expect(getFragments()).toEqual({ test: `false`, other: `value` });
        });

        it('should convert URL hash containing a search string into into a dictionary', () => {
            window.history.pushState({}, 'Test', `#test=false?not_test=true`);
            expect(getFragments()).toEqual({ not_test: `true`, test: 'false' });
            window.history.pushState({}, 'Test', `#test=false?not_test=true&other=value`);
            expect(getFragments()).toEqual({ not_test: `true`, test: 'false', other: `value` });
        });

        it('should convert URL query into into a dictionary', () => {
            window.history.pushState({}, 'Test', `?test=false`);
            expect(getFragments()).toEqual({ test: `false` });
            window.history.pushState({}, 'Test', `?test=false&other=value`);
            expect(getFragments()).toEqual({ test: `false`, other: `value` });
        });

        it('should convert URL search containing a hash string into into a dictionary', () => {
            window.history.pushState({}, 'Test', `?test=false#not_test=true`);
            expect(getFragments()).toEqual({ not_test: `true`, test: 'false' });
            window.history.pushState({}, 'Test', `?test=false#not_test=true&other=value`);
            expect(getFragments()).toEqual({ not_test: `true`, test: 'false', other: `value` });
        });
    });
});
