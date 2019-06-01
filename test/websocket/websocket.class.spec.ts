import { Subject } from 'rxjs'

import { engine, EngineWebsocket } from '../../src/websocket/webocket.class'
import { EngineResponse, EngineCommandRequest } from '../../src/websocket/websocket.interfaces'
import { HashMap } from '../../src/utilities/types.utilities'

describe('EngineWebsocket', () => {
    let websocket: EngineWebsocket
    let fake_socket: Subject<any>
    let another_fake_socket: Subject<any>
    let spy: jasmine.Spy

    beforeEach(() => {
        jest.useFakeTimers()
        fake_socket = new Subject<any>()
        another_fake_socket = new Subject<any>()
        spy = spyOn(engine, 'websocket').and.returnValues(fake_socket, another_fake_socket)
        spyOn(engine, 'log')
        websocket = new EngineWebsocket({
            token: 'test',
            host: 'aca.test',
            fixed: true
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should create an instance', () => {
        expect(websocket).toBeTruthy()
    })

    it('should connect to the websocket', () => {
        expect(engine.websocket).toBeCalledWith(
            `ws://aca.test/control/websocket?bearer=test&fixed_device=true`
        )
    })

    it('should handle bind request', done => {
        let promise = websocket.bind({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' })
        expect(promise).toBeInstanceOf(Promise)
        // Test success
        promise.then(() => {
            promise = websocket.bind({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' })
            expect(promise).toBeInstanceOf(Promise)
            // Test error
            promise.then(null, () => done())
            fake_socket.next({ id: 2, type: 'error', code: 7, msg: 'test error' } as EngineResponse)
        })
        fake_socket.next({ id: 1, type: 'success' } as EngineResponse)
    })

    it('should handle unbind request', done => {
        let promise = websocket.unbind({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' })
        expect(promise).toBeInstanceOf(Promise)
        // Test success
        promise.then(() => {
            promise = websocket.unbind({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' })
            expect(promise).toBeInstanceOf(Promise)
            // Test error
            promise.then(null, () => done())
            fake_socket.next({ id: 2, type: 'error', code: 7, msg: 'test error' } as EngineResponse)
        })
        fake_socket.next({ id: 1, type: 'success' } as EngineResponse)
    })

    it('should handle exec request', done => {
        let promise = websocket.exec({
            sys: 'sys-A0',
            mod: 'mod',
            index: 1,
            name: 'power',
            args: ['test']
        })
        expect(promise).toBeInstanceOf(Promise)
        // Test success
        promise.then(value => {
            expect(value).toBe('test')
            promise = websocket.exec({
                sys: 'sys-A0',
                mod: 'mod',
                index: 1,
                name: 'power',
                args: ['test']
            })
            expect(promise).toBeInstanceOf(Promise)
            // Test error
            promise.then(null, () => done())
            fake_socket.next({ id: 2, type: 'error', code: 7, msg: 'test error' } as EngineResponse)
        })
        fake_socket.next({ id: 1, type: 'success', value: 'test' } as EngineResponse)
    })

    it('should handle debug request', done => {
        const promise = websocket.debug({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' })
        expect(promise).toBeInstanceOf(Promise)
        // Test success
        promise.then(() => {
            fake_socket.next({
                type: 'debug',
                mod: 'test',
                klass: '::klass',
                msg: 'test debug'
            } as EngineResponse)
            expect(engine.log).toBeCalledWith('WS', `[Debug] test::klass →`, 'test debug')
            done()
        })
        fake_socket.next({ id: 1, type: 'success', value: 'test' } as EngineResponse)
    })

    it('should handle ignore request', done => {
        let promise = websocket.ignore({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' })
        expect(promise).toBeInstanceOf(Promise)
        // Test success
        promise.then(() => {
            promise = websocket.ignore({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' })
            expect(promise).toBeInstanceOf(Promise)
            // Test error
            promise.then(null, () => done())
            fake_socket.next({ id: 2, type: 'error', code: 7, msg: 'test error' } as EngineResponse)
        })
        fake_socket.next({ id: 1, type: 'success', value: 'test' } as EngineResponse)
    })

    it('should handle notify responses', done => {
        const binding = { sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' }
        const promise = websocket.bind(binding)
        expect(promise).toBeInstanceOf(Promise)
        // Test success
        promise.then(() => {
            websocket.listen(binding, value => {
                if (value) {
                    expect(value).toBe('Yeah')
                    done()
                }
            })
            fake_socket.next({ type: 'notify', value: 'Yeah', meta: binding } as EngineResponse)
        })
        fake_socket.next({ id: 1, type: 'success' } as EngineResponse)
    })

    it('should reconnect the websocket', done => {
        let actions = 0
        websocket.status((connected: boolean) => {
            actions++
            if (actions === 1) {
                // Websocket connected
                expect(connected).toBe(true)
                fake_socket.error('Error')
                jest.runOnlyPendingTimers()
            } else if (actions === 2) {
                // Websocket disconnected
                expect(connected).toBe(false)
                jest.runOnlyPendingTimers()
            } else if (actions === 3) {
                // Setup websocket
                expect(connected).toBe(true)
                done()
            }
        })
    })

    it('should reconnect when token is updated', done => {
        jest.runOnlyPendingTimers()
        jest.runOnlyPendingTimers()
        let actions = 0
        websocket.status((connected: boolean) => {
            actions++
            if (actions === 1) {
                expect(connected).toBe(true)
                websocket.updateToken('new-token')
                jest.runOnlyPendingTimers()
            } else if (actions === 2) {
                expect(connected).toBe(false)
            } else if (actions === 3) {
                expect(connected).toBe(true)
                done()
            }
        })
    })

    it('should allow to grab the current value of a binding', done => {
        const metadata = { sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' }
        expect(websocket.value(metadata)).toBeUndefined()
        const promise = websocket.bind(metadata)
        promise.then(() => {
            fake_socket.next({ type: 'notify', value: 'Yeah', meta: metadata } as EngineResponse)
            expect(websocket.value(metadata)).toBe('Yeah')
            done()
        })
        fake_socket.next({ id: 1, type: 'success' } as EngineResponse)
    })

    it('should ping the websocket every X seconds', done => {
        fake_socket.subscribe((message: any) => {
            expect(message).toBe('ping')
            done()
        })
        jest.runOnlyPendingTimers()
    })

    it('should handle engine errors', done => {
        fake_socket.next({ id: 0, type: 'error', code: 0, msg: 'test error' } as EngineResponse)
        fake_socket.next({ id: 1, type: 'error', code: 1, msg: 'test error' } as EngineResponse)
        fake_socket.next({ id: 2, type: 'error', code: 2, msg: 'test error' } as EngineResponse)
        fake_socket.next({ id: 3, type: 'error', code: 3, msg: 'test error' } as EngineResponse)
        fake_socket.next({ id: 4, type: 'error', code: 4, msg: 'test error' } as EngineResponse)
        fake_socket.next({ id: 5, type: 'error', code: 5, msg: 'test error' } as EngineResponse)
        fake_socket.next({ id: 6, type: 'error', code: 6, msg: 'test error' } as EngineResponse)
        fake_socket.next({ id: 7, type: 'error', code: 7, msg: 'test error' } as EngineResponse)
        setTimeout(() => {
            expect(engine.log).toBeCalledWith(
                'WS',
                `[Error] PARSE ERROR(0): test error`,
                null,
                'error'
            )
            expect(engine.log).toBeCalledWith(
                'WS',
                `[Error] BAD REQUEST(1): test error`,
                null,
                'error'
            )
            expect(engine.log).toBeCalledWith(
                'WS',
                `[Error] ACCESS DENIED(2): test error`,
                null,
                'error'
            )
            expect(engine.log).toBeCalledWith(
                'WS',
                `[Error] REQUEST FAILED(3): test error`,
                null,
                'error'
            )
            expect(engine.log).toBeCalledWith(
                'WS',
                `[Error] UNKNOWN COMMAND(4): test error`,
                null,
                'error'
            )
            expect(engine.log).toBeCalledWith(
                'WS',
                `[Error] SYSTEM NOT FOUND(5): test error`,
                null,
                'error'
            )
            expect(engine.log).toBeCalledWith(
                'WS',
                `[Error] MODULE NOT FOUND(6): test error`,
                null,
                'error'
            )
            expect(engine.log).toBeCalledWith(
                'WS',
                `[Error] UNEXPECTED FAILURE(7): test error`,
                null,
                'error'
            )
            done()
        })
        jest.runOnlyPendingTimers()
    })

    it('should throw an error on connect if there is no token', () => {
        expect(() => new EngineWebsocket({} as any)).toThrowError()
        expect(() => {
            websocket.updateToken(undefined as any)
            jest.runOnlyPendingTimers()
        }).toThrowError()
    })

    it('should log error when engine message is invalid', () => {
        const message = {}
        fake_socket.next(message)
        expect(engine.log).toBeCalledWith('WS', 'Invalid websocket message', message, 'error')
    })

    it('should delay requests while reconnecting', done => {
        const metadata = { sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' }
        another_fake_socket.subscribe((msg_str: string) => {
            if (msg_str !== 'ping' && typeof msg_str === 'string') {
                const expected: HashMap = { id: 1, cmd: 'bind', ...metadata }
                const message: HashMap = JSON.parse(msg_str)
                for (const key in message) {
                    expect(message[key]).toBe(expected[key])
                }
            }
        })
        websocket.updateToken('test')
        websocket.bind(metadata)
        jest.runOnlyPendingTimers()
        another_fake_socket.next({ id: 1, type: 'success' } as EngineResponse)
        jest.runOnlyPendingTimers()
        done()
    })

    it('should retry connecting if websocket fails to create', () => {
        spy.and.returnValue(undefined)
        const location = {
            ...window.location,
            protocol: 'https:'
        }
        Object.defineProperty(window, 'location', {
            writable: true,
            value: location
        })
        websocket = new EngineWebsocket({
            token: 'test'
        })
        // Exaust retries
        for (let i = 0; i < 6; i++) {
            jest.runOnlyPendingTimers()
        }
        expect(engine.log).toBeCalledTimes(5)
        expect(engine.log).toBeCalledWith('WS', `Failed to create websocket(0). Retrying...`)
        expect(engine.log).toBeCalledWith('WS', `Failed to create websocket(4). Retrying...`)
    })
})
