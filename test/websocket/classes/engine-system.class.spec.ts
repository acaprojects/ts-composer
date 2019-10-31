import { EngineSystemBinding } from '../../../src/websocket/classes/engine-system.class'
import { EngineModuleBinding } from '../../../src/websocket/classes/engine-module.class'

describe('EngineSystemBinding', () => {
    let system: EngineSystemBinding
    let fake_service: any

    beforeEach(() => {
        jest.useFakeTimers()
        fake_service = {}
        system = new EngineSystemBinding(fake_service, 'sys-A0')
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should create an instance', () => {
        expect(system).toBeTruthy()
    })

    it('should have an ID', () => {
        expect(system.id).toBe('sys-A0')
    })

    it('should return modules', () => {
        expect(() => system.module('')).toThrow()
        const test = system.module('Test')
        expect(test).toBeInstanceOf(EngineModuleBinding)
        expect(test).toBe(system.module('Test'))
        expect(test).toBe(system.module('Test_1'))
        expect(test).toBe(system.module('Test', -1))
        expect(test).not.toBe(system.module('Test', 2))
    })
})
