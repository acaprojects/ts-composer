import { EngineSettings } from '../../../../src/http/services/settings/settings.class';

import * as dayjs from 'dayjs';
import { EncryptionLevel } from '../../../../src/http/services/settings/settings.interfaces';

describe('EngineSettings', () => {
    let settings: EngineSettings;
    let service: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        settings = new EngineSettings(service, {
            parent_id: 'sys-01',
            updated_at: dayjs().unix(),
            encryption_level: EncryptionLevel.Admin,
            settings_string: `Test:\n    Here`,
            keys: ['Test']
        });
    });

    it('should create instance', () => {
        expect(settings).toBeTruthy();
        expect(settings).toBeInstanceOf(EngineSettings);
    });

    it('should expose parent ID', () => {
        expect(settings.parent_id).toBe('sys-01');
    });

    it('should expose last update time', () => {
        expect(settings.updated_at).toBe(dayjs().unix());
    });

    it('should expose encryption level', () => {
        expect(settings.encryption_level).toBe(EncryptionLevel.Admin);
    });

    it('should expose settings value', () => {
        expect(settings.settings_string).toBe(`Test:\n    Here`);
    });

    it('should allow changing the settings value', () => {
        settings.value = 'another-setting';
        expect(settings.value).not.toBe('another-setting');
        expect(settings.changes.settings_string).toBe('another-setting');
    });

    it('should expose top level keys', () => {
        expect(settings.keys).toEqual(['Test']);
    });
});
