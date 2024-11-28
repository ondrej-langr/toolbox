import {
  TemplateFile,
  type TemplateHandlerTypeToHandler,
} from './internals/TemplateFile.js';

export function defineTemplateFile<
  K extends keyof TemplateHandlerTypeToHandler,
  H extends TemplateHandlerTypeToHandler[K],
  V extends Record<string, any> = Record<string, any>,
>(type: K, handler: H): TemplateFile<K, H, V> {
  return new TemplateFile(type, handler);
}
