import { EngineApplication } from '../../../../src/http/services/applications/application.class';

describe('EngineApplication', () => {
    let application: EngineApplication;
    let service: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        application = new EngineApplication(service, {
            id: 'dep-test',
            owner_id: 'test-man',
            uid: 'no-so-unique',
            secret: 'Shhh... It\'s a secret',
            scopes: 'office,building,over,there',
            redirect_uri: 'https://over.yonder/oauth.html',
            skip_authorization: true,
            created_at: 999
        });
    });

    it('should create instance', () => {
        expect(application).toBeTruthy();
        expect(application).toBeInstanceOf(EngineApplication);
    });

    it('should expose owner ID', () => {
        expect(application.owner_id).toBe('test-man');
    });

    it('should allow setting owner ID', () => {
        application.storePendingChange('owner_id', 'the-man');
        expect(application.owner_id).not.toBe('the-man');
        expect(application.changes.owner_id).toBe('the-man');
    });

    it('should expose scopes', () => {
        expect(application.scopes).toBe('office,building,over,there');
    });

    it('should allow setting scope', () => {
        application.storePendingChange('scopes', 'new,scope,that,is,cool');
        expect(application.scopes).not.toBe('new,scope,that,is,cool');
        expect(application.changes.scopes).toBe('new,scope,that,is,cool');
    });

    it('should expose redirect_uri', () => {
        expect(application.redirect_uri).toBe('https://over.yonder/oauth.html');
    });

    it('should allow setting redirect_uri', () => {
        application.storePendingChange('redirect_uri', 'http://in.secure/oauth.html');
        expect(application.redirect_uri).not.toBe('http://in.secure/oauth.html');
        expect(application.changes.redirect_uri).toBe('http://in.secure/oauth.html');
    });

    it('should expose skip_authorization', () => {
        expect(application.skip_authorization).toBe(true);
    });

    it('should allow setting skip_authorization', () => {
        application.storePendingChange('skip_authorization', false);
        expect(application.skip_authorization).not.toBe(false);
        expect(application.changes.skip_authorization).toBe(false);
    });

    it('should expose unique ID', () => {
        expect(application.uid).toBe('no-so-unique');
    });

    it('should expose secret', () => {
        expect(application.secret).toBe('Shhh... It\'s a secret');
    });
});
