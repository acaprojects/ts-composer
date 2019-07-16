import { EngineAuthSource } from '../../../../src/http/services/auth-sources/auth-source.class'

describe('EngineAuthSource', () => {
    let domain: EngineAuthSource
    let service: any

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        }
        domain = new EngineAuthSource(service, {
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
        expect(domain).toBeInstanceOf(EngineAuthSource)
    })

    it('should expose creation time', () => {
        expect(domain.created_at).toEqual(999)
    })
})
