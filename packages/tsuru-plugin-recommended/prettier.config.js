import { config } from '@apitree.cz/prettier-config';

export default {
  ...config,
  printWidth: 65,
  importOrder: ['<THIRD_PARTY_MODULES>', '^../', '^[./]', '^@/'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-packagejson',
    ...config.plugins,
  ],
};
