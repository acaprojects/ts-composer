import { MockEngineHttpClient } from '../../../src/http/mock/mock-http.service'
import { MockHttpRequestHandlerOptions } from '../../../src/http/mock/mock-http.interfaces'

describe('MockEngineHttpClient', () => {
    let auth: any
    let service: MockEngineHttpClient

    beforeEach(() => {
        auth = { has_token: true }
        const global_handler: MockHttpRequestHandlerOptions = {
            path: 'test/path',
            method: 'GET',
            metadata: {},
            callback: r => 'test'
        }
        window.control = { handlers: [global_handler] }
        service = new MockEngineHttpClient(auth)
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should create an instance', () => {
        expect(service).toBeTruthy()
        expect(service).toBeInstanceOf(MockEngineHttpClient)
    })

    it('should register global handlers', () => {
        const handler = service.findRequestHandler('GET', 'test/path')
        expect(handler).toBeTruthy()
    })

    it('should register new handlers', () => {
        service.register('please/delete/me', null, 'DELETE')
        let handler = service.findRequestHandler('DELETE', 'please/delete/me')
        expect(handler).toBeTruthy()
        // Check registration of handlers with route parameters
        service.register('please/:get/me', null, 'GET')
        handler = service.findRequestHandler('GET', 'please/join/me')
        expect(handler).toBeTruthy()
    })

    it('should handle route parameters', () => {
        service.register('please/:get/me', null, 'GET')
        const handler = service.findRequestHandler('GET', 'please/join/me')
        expect(handler).toBeTruthy()
        expect((handler || ({} as any)).path_structure).toEqual(['', 'get', ''])
    })

    it('should handle query parameters', () => {})

    describe('GET', () => {
        it('should register new GET handlers', () => {})

        it('should call GET request if there is no handler', () => {})
    })
})
