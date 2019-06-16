import { EngineSystemsService } from '../../../../src/http/services/systems/systems.service'

describe('EngineSystemsService', () => {
    let service: EngineSystemsService
    let http: any

    beforeEach(() => {
        service = new EngineSystemsService(http)
    })

    it('should create instance', () => {
        expect(service).toBeTruthy()
        expect(service).toBeInstanceOf(EngineSystemsService)
    })
})
