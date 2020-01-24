
import * as _dayjs from 'dayjs';
// tslint:disable-next-line:no-duplicate-imports
import { Dayjs, default as _rollupDayjs } from 'dayjs';
/**
 * @hidden
 */
const dayjs = _rollupDayjs || _dayjs;

export function generateMockSystem(overrides: any = {}) {
    if (typeof overrides !== 'object' || !overrides) {
        overrides = {};
    }
    const id = `sys-${Math.floor(Math.random() * 999_999)}`;
    return {
        id,
        name: `System ${Math.floor(Math.random() * 999_999)}`,
        description: ``,
        email: `${id}@acaprojects.com`,
        capacity: Math.floor(Math.random() * 11 + 1) * 2,
        features: 'VC',
        bookable: Math.floor(Math.random() * 99999999) % 2 === 0,
        installed_ui_devices: Math.floor(Math.random() * 50),
        zones: Array(Math.floor(Math.random() * 5)).fill(0).map(i => `zone_test-${Math.floor(Math.random() * 999_999)}`),
        modules: Array(Math.floor(Math.random() * 5)).fill(0).map(i => `mod_test-${Math.floor(Math.random() * 999_999)}`),
        settings: {},
        created_at: dayjs().subtract(Math.floor(Math.random() * 100000), 'm').unix(),
        support_url: `/control/${id}`,
        ...overrides
    };
}
