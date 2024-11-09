import { Config } from '~/internals/Config';

export const defineConfig = (...params: ConstructorParameters<typeof Config>) =>
  new Config(...params);
