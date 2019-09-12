import { EngineDriversService } from '../../../../src/http/services/drivers/drivers.service'
import { EngineDriver } from '../../../../src/http/services/drivers/driver.class'
import { of } from 'rxjs'

describe('EngineDriversService', () => {
    let service: EngineDriversService
    let http: any

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        }
        service = new EngineDriversService(http)
    })

    it('should create instance', () => {
        expect(service).toBeTruthy()
        expect(service).toBeInstanceOf(EngineDriversService)
    })

    it('allow querying dependencies index', async () => {
        http.get.mockReturnValueOnce(of({ results: [{ id: 'test' }], total: 10 }))
        const result = await service.query()
        expect(http.get).toBeCalledWith('/api/engine/v1/dependencies')
        expect(result).toBeInstanceOf(Array)
        expect(result[0]).toBeInstanceOf(EngineDriver)
    })

    it('allow reloading a driver', async () => {
        http.post.mockReturnValueOnce(of(null))
        await service.reload('test')
        expect(http.post).toBeCalledWith('/api/engine/v1/dependencies/test/reload', {
            _task: 'reload',
            id: 'test'
        })
    })
})
