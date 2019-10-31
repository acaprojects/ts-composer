import { toQueryString } from '../../src/utilities/api.utilities'

describe('API Utilities', () => {
    describe('generattoQueryStringeNonce', () => {
        it('converts object into URL query string', () => {
            // Check method
            expect(toQueryString({ test: 'value' })).toBe('test=value')
            // Multiple properties
            expect(toQueryString({ test: 'new_value', other: 'person' })).toBe(
                'test=new_value&other=person'
            )
            // Number properties
            expect(toQueryString({ number: 9 })).toBe('number=9')
            // Boolean properties
            expect(toQueryString({ bool: false })).toBe('bool=false')
            expect(toQueryString({ bool: true })).toBe('bool=true')
        })
    })
})
