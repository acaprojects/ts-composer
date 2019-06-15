import Composer from '../src/ts-composer'

describe('Composer', () => {
    it('constuctor throws error', () => {
        expect(() => new Composer()).toThrow()
    })
})
