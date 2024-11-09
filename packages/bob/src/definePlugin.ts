import { Plugin } from './internals/Plugin.js';

export const definePlugin = (...params: ConstructorParameters<typeof Plugin>) =>
  new Plugin(...params);
