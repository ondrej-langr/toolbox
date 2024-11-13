import {
  TemplateFile,
  type TemplateHandlerTypeToHandler,
} from './internals/TemplateFile.js';

export function defineTemplateFile<
  K extends keyof TemplateHandlerTypeToHandler,
  H extends TemplateHandlerTypeToHandler[K],
>(type: K, handler: H) {
  return new TemplateFile(type, handler);
}
