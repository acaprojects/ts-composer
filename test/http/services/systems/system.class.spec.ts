import { EngineSystem } from '../../../../src/http/services/systems/system.class'

describe('EngineSystem', () => {
    let system: EngineSystem
    let service: any

    beforeEach(() => {
        service = {
            add: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            task: jest.fn()
        }
        system = new EngineSystem(service, { id: 'sys-test' })
    })

    it('should create instance', () => {
        expect(system).toBeTruthy()
        expect(system).toBeInstanceOf(EngineSystem)
    })
})
