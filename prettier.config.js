import { config as apitreeConfig } from '@apitree.cz/prettier-config';

export default {
  ...apitreeConfig,
  importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderSeparation: true,
  plugins: [...apitreeConfig.plugins, '@trivago/prettier-plugin-sort-imports'],
};
