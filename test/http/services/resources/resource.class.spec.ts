import { EngineResource } from '../../../../src/http/services/resources/resource.class'

class Resource extends EngineResource {}

describe('EngineResource', () => {
    let resource: Resource
    let service: any

    beforeEach(() => {
        service = {
            add: jest.fn(),
            delete: jest.fn(),
            update: jest.fn()
        }
        service.add.mockReturnValue(Promise.resolve())
        service.delete.mockReturnValue(Promise.resolve())
        service.update.mockReturnValue(Promise.resolve())
        resource = new Resource(service, { id: 'test', name: 'Test' })
    })

    it('should expose id', () => {
        expect(resource.id).toBe('test')
    })

    it('should expose name', () => {
        expect(resource.name).toBe('Test')
    })

    it('should allow changing the name', () => {
        resource.name = 'Another Test'
        expect(resource.name).toBe('Test')
        expect(resource.changes.name).toBe('Another Test')
    })

    it('should allow saving new resource', async () => {
        expect.assertions(2)
        try {
            await resource.save()
            throw Error('Failed to throw')
        } catch (e) {
            expect(e).toBe('No changes have been made')
        }
        resource.name = 'Another Test'
        ;(resource as any).id = undefined
        await resource.save()
        expect(service.add).toBeCalledWith({ ...resource, ...resource.changes })
    })

    it('should allow updating existing resource', async () => {
        expect.assertions(1)
        resource.name = 'Another Test'
        await resource.save()
        expect(service.update).toBeCalledWith(resource.id, { ...resource, ...resource.changes })
    })

    it('should allow deleting exisiting resource', async () => {
        await resource.delete()
        expect(service.delete).toBeCalledWith(resource.id)
    })
})
