import { EngineSettings } from '../../../../src/http/services/settings/settings.class';
import { generateMockSettings } from '../../../../src/http/services/settings/settings.utilities';

import * as dayjs from 'dayjs';

describe('EngineSettings', () => {
    let settings: EngineSettings;
    let service: any;
    let item: any;

    beforeEach(() => {
        service = {
            reload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn()
        };
        item = generateMockSettings();
        settings = new EngineSettings(service, item);
    });

    it('should create instance', () => {
        expect(settings).toBeTruthy();
        expect(settings).toBeInstanceOf(EngineSettings);
    });

    it('should expose parent ID', () => {
        expect(settings.parent_id).toBe(item.parent_id);
    });

    it('should expose last update time', () => {
        expect(settings.updated_at).toBe(item.updated_at);
    });

    it('should expose encryption level', () => {
        expect(settings.encryption_level).toBe(item.encryption_level);
    });

    it('should expose settings value', () => {
        expect(settings.settings_string).toBe(item.settings_string);
    });

    it('should allow changing the settings value', () => {
        settings.value = 'another-setting';
        expect(settings.value).not.toBe('another-setting');
        expect(settings.changes.settings_string).toBe('another-setting');
    });

    it('should expose top level keys', () => {
        expect(settings.keys).toEqual(item.keys);
    });
});
