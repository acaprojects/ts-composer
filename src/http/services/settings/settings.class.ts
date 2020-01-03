import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EncryptionLevel } from './settings.interfaces';
import { EngineSettingsService } from './settings.service';

import * as _dayjs from 'dayjs';
// tslint:disable-next-line:no-duplicate-imports
import { Dayjs, default as _rollupDayjs } from 'dayjs';
/**
 * @hidden
 */
const dayjs = _rollupDayjs || _dayjs;

export class EngineSettings extends EngineResource<EngineSettingsService> {
    /** ID of the parent zone/system/module/driver */
    public readonly parent_id: string;
    /** Unix timestamp in seconds of when the settings where last updated */
    public readonly updated_at: number;
    /** Access level for the settings data */
    public readonly encryption_level: EncryptionLevel;
    /** Contents of the settings */
    public readonly settings_string: string;
    /** Top level keys for the parsed settings */
    public readonly keys: string[];

    /** Content of the settings */
    public get value(): string {
        return this.settings_string || '';
    }
    public set value(value: string) {
        this.change('settings_string', value);
    }

    constructor(protected _service: EngineSettingsService, raw_data: HashMap) {
        super(_service, raw_data);
        this.parent_id = raw_data.parent_id || '';
        this.updated_at = raw_data.updated_at || dayjs().unix();
        this.settings_string = raw_data.settings_string || '';
        this.encryption_level = raw_data.encryption_level || EncryptionLevel.None;
        this.keys = raw_data.keys || [];
    }
}
