import { EngineUser } from '../../../../src/http/services/users/user.class';

describe('EngineUser', () => {
    let user: EngineUser;
    let service: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        user = new EngineUser(service, {
            id: 'dep-test',
            authority_id: 'On who\'s authority',
            email: 'jon@tron.game',
            phone: '+612000000000',
            country: 'Australia',
            image: '',
            metadata: 'there be none',
            login_name: 'elitedarklord',
            staff_id: 'PERSON_12345',
            first_name: 'Bob',
            last_name: 'Marley',
            created_at: 999
        });
    });

    it('should create instance', () => {
        expect(user).toBeTruthy();
        expect(user).toBeInstanceOf(EngineUser);
    });

    it('should expose Authority ID', () => {
        expect(user.authority_id).toBe('On who\'s authority');
    });

    it('should allow setting Authority ID on new users', () => {
        expect(() => user.storePendingChange('authority_id', 'empty-authority')).toThrowError();
        const new_user = new EngineUser(service, {});
        new_user.storePendingChange('authority_id', 'my-authority');
        expect(new_user.authority_id).not.toBe('my-authority');
        expect(new_user.changes.authority_id).toBe('my-authority');
    });

    it('should expose Email', () => {
        expect(user.email).toBe('jon@tron.game');
    });

    it('should allow setting Email', () => {
        user.storePendingChange('email', 'big@hero.six');
        expect(user.email).not.toBe('big@hero.six');
        expect(user.changes.email).toBe('big@hero.six');
    });

    it('should expose Phone', () => {
        expect(user.phone).toBe('+612000000000');
    });

    it('should allow setting Phone', () => {
        user.storePendingChange('phone', '+61434625232');
        expect(user.phone).not.toBe('+61434625232');
        expect(user.changes.phone).toBe('+61434625232');
    });

    it('should expose Country', () => {
        expect(user.country).toBe('Australia');
    });

    it('should allow setting Country', () => {
        user.storePendingChange('country', 'Antartica');
        expect(user.country).not.toBe('Antartica');
        expect(user.changes.country).toBe('Antartica');
    });

    it('should expose image', () => {
        expect(user.image).toBe('');
    });

    it('should allow setting image', () => {
        user.storePendingChange('image', '/cat.jpeg');
        expect(user.image).not.toBe('/cat.jpeg');
        expect(user.changes.image).toBe('/cat.jpeg');
    });

    it('should expose metadata', () => {
        expect(user.metadata).toBe('there be none');
    });

    it('should allow setting metadata', () => {
        user.storePendingChange('metadata', 'there be some');
        expect(user.metadata).not.toBe('there be some');
        expect(user.changes.metadata).toBe('there be some');
    });

    it('should expose login name', () => {
        expect(user.login_name).toBe('elitedarklord');
    });

    it('should allow setting login name', () => {
        user.storePendingChange('login_name', 'warrior_of_light');
        expect(user.login_name).not.toBe('warrior_of_light');
        expect(user.changes.login_name).toBe('warrior_of_light');
    });

    it('should expose staff ID', () => {
        expect(user.staff_id).toBe('PERSON_12345');
    });

    it('should allow setting staff ID', () => {
        user.storePendingChange('staff_id', 'NON_PERSON');
        expect(user.staff_id).not.toBe('NON_PERSON');
        expect(user.changes.staff_id).toBe('NON_PERSON');
    });

    it('should expose first name', () => {
        expect(user.first_name).toBe('Bob');
    });

    it('should allow setting first name', () => {
        user.storePendingChange('first_name', 'Johnny');
        expect(user.first_name).not.toBe('Johnny');
        expect(user.changes.first_name).toBe('Johnny');
    });

    it('should expose last name', () => {
        expect(user.last_name).toBe('Marley');
    });

    it('should allow setting last name', () => {
        user.storePendingChange('last_name', 'English');
        expect(user.last_name).not.toBe('English');
        expect(user.changes.last_name).toBe('English');
    });
});
