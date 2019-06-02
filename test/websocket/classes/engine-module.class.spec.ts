import { EngineModuleBinding } from '../../../src/websocket/classes/engine-module.class'
import { EngineVariableBinding } from '../../../src/websocket/classes/engine-status-variable.class'

describe('EngineSystemBinding', () => {
    let module: EngineModuleBinding
    let fake_service: any
    let fake_system: any

    beforeEach(() => {
        jest.useFakeTimers()
        fake_service = { engine: { status: (_: boolean) => null, exec: (_: any) => null } }
        spyOn(fake_service.engine, 'status').and.returnValue('test')
        spyOn(fake_service.engine, 'exec').and.returnValue(Promise.resolve())
        fake_system = { id: 'sys-A0' }
        module = new EngineModuleBinding(fake_service, fake_system, 'Test_1')
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should create an instance', () => {
        expect(module).toBeTruthy()
    })

    it('should expose system', () => {
        expect(module.system).toBe(fake_system)
    })

    it("should expose it's name and index", () => {
        expect(module.name).toBe('Test')
        expect(module.index).toBe(1)
        module = new EngineModuleBinding(fake_service, fake_system, '')
        expect(module.index).toBe(1)
    })

    it('should return bindings', () => {
        const binding = module.binding('test')
        expect(binding).toBeTruthy()
        expect(binding).toBeInstanceOf(EngineVariableBinding)
        expect(module.binding('test')).toBe(binding)
    })

    it('should allow methods to be executed', () => {
        const promise = module.exec('testCall')
        expect(promise).toBeInstanceOf(Promise)
        expect(fake_service.engine.exec).toBeCalledWith({
            sys: fake_system.id,
            mod: module.name,
            index: module.index,
            name: 'testCall',
            args: undefined
        })
    })
})
