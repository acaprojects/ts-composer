import { of } from 'rxjs'

import { EngineAuthSource } from '../../../../src/http/services/auth-sources/auth-source.class'
import { EngineAuthSourcesService } from '../../../../src/http/services/auth-sources/auth-sources.service'

describe('EngineDomainsService', () => {
    let service: EngineAuthSourcesService
    let http: any

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        }
        service = new EngineAuthSourcesService(http)
    })

    it('should create instance', () => {
        expect(service).toBeTruthy()
        expect(service).toBeInstanceOf(EngineAuthSourcesService)
    })

    it('allow querying systems index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }))
        const result = await service.query()
        expect(http.get).toBeCalledWith('/api/engine/v1/authsources')
        expect(result).toBeInstanceOf(Array)
        expect(result[0]).toBeInstanceOf(EngineAuthSource)
    })

    it('allow querying systems show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }))
        const result = await service.show('test')
        expect(http.get).toBeCalledWith('/api/engine/v1/authsources/test')
        expect(result).toBeInstanceOf(EngineAuthSource)
    })
})
