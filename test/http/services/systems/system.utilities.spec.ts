
import { generateMockSystem } from '../../../../src/http/services/systems/system.utilities';

describe('System Utilities', () => {
    describe('generateMockSystem', () => {
        it('should create a randomly generated mock system', () => {
            let system = generateMockSystem();
            expect(system).toBeInstanceOf(Object);
            system = generateMockSystem('test');
            expect(system).toBeInstanceOf(Object);
        });
        it('should allow for overriding fields', () => {
            const system = generateMockSystem({ id: 'test' });
            expect(system).toBeInstanceOf(Object);
            expect(system.id).toBe('test');
        });
    });
});
