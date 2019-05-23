import Composer from '../src/ts-composer';

describe('Composer', () => {
    it('is instantiable', () => {
        expect(new Composer()).toBeInstanceOf(Composer);
    });
});
