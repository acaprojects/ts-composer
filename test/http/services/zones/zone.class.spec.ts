import { EngineZone } from '../../../../src/http/services/zones/zone.class'

describe('EngineZone', () => {
    let zone: EngineZone
    let service: any

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        }
        zone = new EngineZone(service, {
            id: 'dep-test',
            description: 'In a galaxy far far away...',
            settings: { today: false, future: 'Yeah!' },
            triggers: ['trig-001'],
            created_at: 999
        })
    })

    it('should create instance', () => {
        expect(zone).toBeTruthy()
        expect(zone).toBeInstanceOf(EngineZone)
    })

    it('should expose description', () => {
        expect(zone.description).toBe('In a galaxy far far away...')
    })

    it('should allow setting description', () => {
        zone.description = 'another-desc'
        expect(zone.description).not.toBe('another-desc')
        expect(zone.changes.description).toBe('another-desc')
    })

    it('should expose settings', () => {
        expect(zone.settings).toEqual({ today: false, future: 'Yeah!' })
    })

    it('should allow updating zone settings', () => {
        const new_settings = { work: 'overtime' }
        zone.settings = new_settings
        expect(zone.settings).not.toBe(new_settings)
        expect(zone.changes.settings).toBe(new_settings)
    })

    it('should expose triggers', () => {
        expect(zone.triggers).toEqual(['trig-001'])
    })

    it('should expose class name', () => {
        expect(zone.created_at).toEqual(999)
    })
})
