import { of } from 'rxjs'

import { EngineZone } from '../../../../src/http/services/zones/zone.class'
import { EngineZonesService } from '../../../../src/http/services/zones/zones.service'

describe('EngineZonesService', () => {
    let service: EngineZonesService
    let http: any

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        }
        service = new EngineZonesService(http)
    })

    it('should create instance', () => {
        expect(service).toBeTruthy()
        expect(service).toBeInstanceOf(EngineZonesService)
    })

    it('allow querying systems index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }))
        const result = await service.query()
        expect(http.get).toBeCalledWith('/control/api/zones')
        expect(result).toBeInstanceOf(Array)
        expect(result[0]).toBeInstanceOf(EngineZone)
    })

    it('allow querying systems show', async () => {
        http.get.mockReturnValueOnce(of({ id: 'test' }))
        const result = await service.show('test')
        expect(http.get).toBeCalledWith('/control/api/zones/test')
        expect(result).toBeInstanceOf(EngineZone)
    })
})
