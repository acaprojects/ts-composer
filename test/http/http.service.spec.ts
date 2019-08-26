import { EngineHttpClient } from '../../src/http/http.service'

describe('EngineHttpClient', () => {
    let auth: any
    let service: EngineHttpClient

    beforeEach(() => {
        auth = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        }
        service = new EngineHttpClient(auth)
    })

    it('should create an instance', () => {
        expect(service).toBeTruthy()
        expect(service).toBeInstanceOf(EngineHttpClient)
    })
})
