import Composer from '../src/composer';

describe('Composer', () => {
    it('constuctor throws error', () => {
        expect(() => new Composer()).toThrow();
    });
});
