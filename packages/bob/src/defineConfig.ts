import { Config } from './internals/Config.js';

export const defineConfig = (...params: ConstructorParameters<typeof Config>) =>
  new Config(...params);
