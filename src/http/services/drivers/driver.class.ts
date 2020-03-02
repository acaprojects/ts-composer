
import { first } from 'rxjs/operators';

import { ACAEngine } from '../../../acaengine';
import { HashMap } from '../../../utilities/types.utilities';
import { EngineResource } from '../resources/resource.class';
import { EngineSettings } from '../settings/settings.class';
import { EngineDriverRole } from './drivers.enums';
import { EngineDriversService } from './drivers.service';

export const DRIVER_MUTABLE_FIELDS = [
    'name',
    'description',
    'module_name',
    'role',
    'default',
    'ignore_connected',
    'repository_id',
    'file_name',
    'commit'
] as const;
type DriverMutableTuple = typeof DRIVER_MUTABLE_FIELDS;
export type DriverMutableFields = DriverMutableTuple[number];

/** List of property keys that can only be set when creating a new object */
const NON_EDITABLE_FIELDS = ['role', 'repository_id', 'file_name'];

export class EngineDriver extends EngineResource<EngineDriversService> {
    /** Engine class name of the driver */
    public readonly class_name: string;
    /** Description of the driver functionality */
    public readonly description: string;
    /** Name to use for modules that inherit this driver */
    public readonly module_name: string;
    /** Role of the driver in engine */
    public readonly role: EngineDriverRole;
    /** Default settings for the driver */
    public readonly default: string;
    /** ID of the repository the driver is from */
    public readonly repository_id: string;
    /** Name of the file from the repository to load the driver logic from */
    public readonly file_name: string;
    /** Version of the driver logic to use */
    public readonly commit: string;
    /** Ignore connection issues */
    public readonly ignore_connected: boolean;
    /** Map of user settings for the system */
    public settings: EngineSettings;

    constructor(protected _service: EngineDriversService, raw_data: HashMap) {
        super(_service, raw_data);
        this.description = raw_data.description || '';
        this.module_name = raw_data.module_name || '';
        this.role = raw_data.role || EngineDriverRole.Logic;
        this.default = raw_data.default || '';
        this.ignore_connected = raw_data.ignore_connected || false;
        this.class_name = raw_data.class_name || '';
        this.repository_id = raw_data.repository_id || '';
        this.file_name = raw_data.file_name || '';
        this.commit = raw_data.commit || '';
        this.settings = new EngineSettings({} as any, raw_data.settings || { parent_id: this.id });
        ACAEngine.initialised.pipe(first(has_inited => has_inited)).subscribe(() => {
            this.settings = new EngineSettings(
                ACAEngine.settings,
                raw_data.settings || { parent_id: this.id }
            );
        });
    }

    public storePendingChange(
        key: DriverMutableFields,
        value: EngineDriver[DriverMutableFields]
    ): this {
        return super.storePendingChange(key as any, value);
    }

    /**
     * Live load/reload the driver
     */
    public reload(): Promise<void> {
        if (!this.id) {
            throw new Error('You must save the module before it can be started');
        }
        return this._service.reload(this.id);
    }
}
