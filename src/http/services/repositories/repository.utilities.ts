
import * as faker from 'faker';

/* istanbul ignore next */
/**
 * Generate mocked out repository object metadata
 * @param overrides Map of overrides for top level keys
 */
export function generateMockRepository(overrides: any = {}) {
    if (typeof overrides !== 'object' || !overrides) {
        overrides = {};
    }
    const company = faker.company.companyName().split(' ').join('-').toLowerCase();
    const product = faker.commerce.productName().split(' ').join('-');
    return {
        id: `repository-${Math.floor(Math.random() * 999_999_999)}`,
        name: `${product}`,
        folder_name: `${company}/${product}`,
        description: faker.lorem.paragraph(),
        uri: `https://github.com/acaengine/${company}-drivers`,
        commit_hash: 'HEAD',
        type: Math.floor(Math.random() * 999_999_999) % 2,
        ...overrides
    };
}
