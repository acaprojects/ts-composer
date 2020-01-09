import * as dayjs from 'dayjs';

/**
 * Generate mocked out settings object metadata
 * @param overrides Map of overrides for top level keys
 */
export function generateMockSettings(overrides: any = {}) {
    if (typeof overrides !== 'object' || !overrides) {
        overrides = {};
    }
    const parent_types = ['zone', 'sys', 'mod', 'driver'];
    const created = dayjs()
        .startOf('m')
        .subtract(Math.floor(Math.random() * 99) * 15, 'm');
    return {
        id: `setting-${Math.floor(Math.random() * 999_999_999)}`,
        parent_id: `${parent_types[Math.floor(Math.random() * parent_types.length)]}-${Math.floor(
            Math.random() * 999_999_999
        )}`,
        created_at: created.unix(),
        updated_at: created.add(Math.floor(Math.random() * 20) * 15, 'm').unix(),
        encryption_level: Math.floor(Math.random() * 4),
        settings_string: '',
        keys: [],
        ...overrides
    };
}
