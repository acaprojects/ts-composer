import { EngineDriver } from '../../../../src/http/services/drivers/driver.class'
import { EngineDriverRole } from '../../../../src/http/services/drivers/drivers.enums'

describe('EngineDriver', () => {
    let driver: EngineDriver
    let service: any

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        }
        driver = new EngineDriver(service, {
            id: 'dep-test',
            description: 'In a galaxy far far away...',
            module_name: 'SteamShip',
            role: EngineDriverRole.Logic,
            default: 'Sometimes we default',
            ignore_connected: false,
            settings: { today: false, future: 'Yeah!' },
            class_name: '::ACA::SolveProblem',
            created_at: 999
        })
    })

    it('should create instance', () => {
        expect(driver).toBeTruthy()
        expect(driver).toBeInstanceOf(EngineDriver)
    })

    it('should expose description', () => {
        expect(driver.description).toBe('In a galaxy far far away...')
    })

    it('should allow setting description', () => {
        driver.description = 'another-desc'
        expect(driver.description).not.toBe('another-desc')
        expect(driver.changes.description).toBe('another-desc')
    })

    it('should expose module name', () => {
        expect(driver.module_name).toBe('SteamShip')
    })

    it('should allow setting module name', () => {
        driver.module_name = 'a_mod_name'
        expect(driver.module_name).not.toBe('a_mod_name')
        expect(driver.changes.module_name).toBe('a_mod_name')
    })

    it('should expose role', () => {
        expect(driver.role).toBe(EngineDriverRole.Logic)
    })

    it('should allow setting role on new modules', () => {
        try {
            driver.role = EngineDriverRole.Service
            throw Error('Failed to throw error')
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to throw error'))
        }
        const new_mod = new EngineDriver(service, {})
        new_mod.role = EngineDriverRole.Service
        expect(new_mod.role).not.toBe(EngineDriverRole.Service)
        expect(new_mod.changes.role).toBe(EngineDriverRole.Service)
    })

    it('should expose default', () => {
        expect(driver.default).toBe('Sometimes we default')
    })

    it('should allow setting default', () => {
        driver.default = 'No default today'
        expect(driver.default).not.toBe('No default today')
        expect(driver.changes.default).toBe('No default today')
    })

    it('should expose ignore connected', () => {
        expect(driver.ignore_connected).toBe(false)
    })

    it('should allow setting default', () => {
        driver.ignore_connected = true
        expect(driver.ignore_connected).not.toBe(true)
        expect(driver.changes.ignore_connected).toBe(true)
    })

    it('should expose settings', () => {
        expect(driver.settings).toEqual({ today: false, future: 'Yeah!' })
    })

    it('should allow updating driver settings', () => {
        const new_settings = { work: 'overtime' }
        driver.settings = new_settings
        expect(driver.settings).not.toBe(new_settings)
        expect(driver.changes.settings).toBe(new_settings)
    })

    it('should allow reloading the driver', async () => {
        service.reload.mockReturnValue(Promise.resolve())
        await driver.reload()
        expect(service.reload).toBeCalledWith('dep-test')
        const new_driver = new EngineDriver(service, {})
        try {
            new_driver.reload()
            throw new Error('Failed to error')
        } catch (e) {
            expect(e).not.toEqual(new Error('Failed to error'))
        }
    })

    it('should expose class name', () => {
        expect(driver.class_name).toEqual('::ACA::SolveProblem')
    })

    it('should expose class name', () => {
        expect(driver.created_at).toEqual(999)
    })
})
