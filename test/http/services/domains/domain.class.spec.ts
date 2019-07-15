import { EngineDomain } from '../../../../src/http/services/domains/domain.class'

describe('EngineDomain', () => {
    let domain: EngineDomain
    let service: any

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        }
        domain = new EngineDomain(service, {
            id: 'dep-test',
            domain: 'here.today',
            login_url: 'somewhere.today',
            logout_url: 'no-where.today',
            description: 'In a galaxy far far away...',
            config: { today: false, future: 'Yeah!' },
            internals: { today: true, future: 'Nope!' },
            created_at: 999
        })
    })

    it('should create instance', () => {
        expect(domain).toBeTruthy()
        expect(domain).toBeInstanceOf(EngineDomain)
    })

    it('should expose domain', () => {
        expect(domain.domain).toBe('here.today')
    })

    it('should allow setting description', () => {
        domain.domain = 'another.dom'
        expect(domain.domain).not.toBe('another.dom')
        expect(domain.changes.dom).toBe('another.dom')
    })

    it('should expose login URL', () => {
        expect(domain.login_url).toBe('somewhere.today')
    })

    it('should allow setting login URL', () => {
        domain.login_url = 'some.dom'
        expect(domain.login_url).not.toBe('some.dom')
        expect(domain.changes.login_url).toBe('some.dom')
    })

    it('should expose logout URL', () => {
        expect(domain.logout_url).toBe('no-where.today')
    })

    it('should allow setting logout URL', () => {
        domain.logout_url = 'koko-doko.dom'
        expect(domain.logout_url).not.toBe('koko-doko.dom')
        expect(domain.changes.logout_url).toBe('koko-doko.dom')
    })

    it('should expose description', () => {
        expect(domain.description).toBe('In a galaxy far far away...')
    })

    it('should allow setting description', () => {
        domain.description = 'another-desc'
        expect(domain.description).not.toBe('another-desc')
        expect(domain.changes.description).toBe('another-desc')
    })

    it('should expose config', () => {
        expect(domain.config).toEqual({ today: false, future: 'Yeah!' })
    })

    it('should allow updating domain config', () => {
        const new_settings = { work: 'overtime' }
        domain.config = new_settings
        expect(domain.config).not.toBe(new_settings)
        expect(domain.changes.config).toBe(new_settings)
    })

    it('should expose internals', () => {
        expect(domain.internals).toEqual({ today: true, future: 'Nope!' })
    })

    it('should allow updating domain internals', () => {
        const new_settings = { work: 'less' }
        domain.internals = new_settings
        expect(domain.internals).not.toBe(new_settings)
        expect(domain.changes.internals).toBe(new_settings)
    })

    it('should expose creation time', () => {
        expect(domain.created_at).toEqual(999)
    })
})
