import { EngineRepository } from '../../../../src/http/services/repositories/repository.class';
import { EngineRepositoryType } from '../../../../src/http/services/repositories/repository.interfaces';
import { generateMockRepository } from '../../../../src/http/services/repositories/repository.utilities';

describe('EngineRepository', () => {
    let repository: EngineRepository;
    let service: any;
    let mock_data: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        mock_data = generateMockRepository({ type: EngineRepositoryType.Driver });
        repository = new EngineRepository(service, mock_data);
    });

    it('should create instance', () => {
        expect(repository).toBeTruthy();
        expect(repository).toBeInstanceOf(EngineRepository);
    });

    it('should expose commit hash', () => {
        expect(repository.commit_hash).toBe(mock_data.commit_hash);
    });

    it('should allow setting commit_hash', () => {
        repository.storePendingChange('commit_hash', '~HEAD-2');
        expect(repository.commit_hash).not.toBe('~HEAD-2');
        expect(repository.changes.commit_hash).toBe('~HEAD-2');
    });

    it('should expose folder name', () => {
        expect(repository.folder_name).toBe(mock_data.folder_name);
    });

    it('should allow setting Phone', () => {
        repository.storePendingChange('folder_name', 'test/this/folder');
        expect(repository.folder_name).not.toBe('test/this/folder');
        expect(repository.changes.folder_name).toBe('test/this/folder');
    });

    it('should expose description', () => {
        expect(repository.description).toBe(mock_data.description);
    });

    it('should allow setting description', () => {
        repository.storePendingChange('description', 'Antartica');
        expect(repository.description).not.toBe('Antartica');
        expect(repository.changes.description).toBe('Antartica');
    });

    it('should expose URI', () => {
        expect(repository.uri).toBe(mock_data.uri);
    });

    it('should allow setting URI', () => {
        repository.storePendingChange('uri', '/cat.jpeg');
        expect(repository.uri).not.toBe('/cat.jpeg');
        expect(repository.changes.uri).toBe('/cat.jpeg');
    });

    it('should expose type', () => {
        expect(repository.type).toBe(EngineRepositoryType.Driver);
    });

    it('should allow setting type', () => {
        repository.storePendingChange('type', EngineRepositoryType.Interface);
        expect(repository.type).not.toBe(EngineRepositoryType.Interface);
        expect(repository.changes.type).toBe(EngineRepositoryType.Interface);
    });
});
