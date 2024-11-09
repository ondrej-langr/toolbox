import { Plugin } from '~/internals/Plugin';

export const definePlugin = (...params: ConstructorParameters<typeof Plugin>) =>
  new Plugin(...params);
