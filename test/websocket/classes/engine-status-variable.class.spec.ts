import { Subject } from 'rxjs'

import { EngineVariableBinding } from '../../../src/websocket/classes/engine-status-variable.class'

describe('EngineVariableBinding', () => {
    let status: EngineVariableBinding
    let fake_service: any
    let fake_module: any
    let fake_system: any
    let state_subject: Subject<boolean>

    beforeEach(() => {
        jest.useFakeTimers()
        state_subject = new Subject()
        fake_service = {
            engine: {
                status: (next: (_: boolean) => void) =>
                    state_subject.asObservable().subscribe(next),
                bind: (_: any) => null,
                unbind: (_: any) => null,
                listen: (_: any, next: (_: any) => void) => next(10),
                value: (_: any) => undefined
            }
        }
        spyOn(fake_service.engine, 'bind').and.returnValue(Promise.resolve())
        spyOn(fake_service.engine, 'unbind').and.returnValue(Promise.resolve())
        fake_system = { id: 'sys-A0' }
        fake_module = { system: fake_system, name: 'Test', index: 1 }
        status = new EngineVariableBinding(fake_service, fake_module, 'test')
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should create an instance', () => {
        expect(status).toBeTruthy()
    })

    it('should expose it name', () => {
        expect(status.name).toBe('test')
    })

    it('should bind to the status variable', done => {
        jest.useRealTimers()
        const unbind = status.bind()
        expect(unbind).toBeInstanceOf(Function)
        expect(fake_service.engine.bind).toBeCalled()
        setTimeout(() => {
            expect(status.count).toBe(1)
            done()
        })
    })

    it('should unbind to the status variable', done => {
        jest.useRealTimers()
        status.bind()
        const unbind = status.bind()
        setTimeout(() => {
            expect(status.count).toBe(2)
            unbind()
            setTimeout(() => {
                expect(status.count).toBe(1)
                status.unbind()
                setTimeout(() => {
                    expect(status.count).toBe(0)
                    expect(fake_service.engine.unbind).toBeCalledTimes(1)
                    // Check that the binding count doesn't go below 0
                    status.unbind()
                    setTimeout(() => {
                        expect(status.count).toBe(0)
                        done()
                    })
                })
            })
        })
    })

    it('should expose the binding value', () => {
        expect(status.value).toBeUndefined()
        fake_service.engine.value = (_: any) => 10
        expect(status.value).toBe(10)
    })

    it('should allow for subscribing to the binding value', done => {
        status.listen(value => {
            expect(value).toBe(10)
            done()
        })
    })

    it('should rebind to bindings on websocket reconnect', done => {
        jest.useRealTimers()
        state_subject.next(true)
        state_subject.next(false)
        setTimeout(() => {
            expect(fake_service.engine.bind).not.toBeCalled()
            status.bind()
            setTimeout(() => {
                state_subject.next(false)
                state_subject.next(true)
                setTimeout(() => {
                    expect(fake_service.engine.bind).toBeCalled()
                    done()
                })
            })
        })
    })
})
