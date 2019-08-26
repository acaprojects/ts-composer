import { MockEngineHttpClient } from '../../../src/http/mock/mock-http.service'

describe('MockEngineHttpClient', () => {
    let auth: any
    let service: MockEngineHttpClient

    beforeEach(() => {
        auth = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        }
        service = new MockEngineHttpClient(auth)
    })

    it('should create an instance', () => {
        expect(service).toBeTruthy()
        expect(service).toBeInstanceOf(MockEngineHttpClient)
    })
})
