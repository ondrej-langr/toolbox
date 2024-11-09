import { TemplateFile, TemplateHandlerTypeToHandler } from './internals/TemplateFile.js';

export function defineTemplateFil<
  K extends keyof TemplateHandlerTypeToHandler,
  H extends TemplateHandlerTypeToHandler[K],
>(type: K, handler: H) {
  return new TemplateFile(type, handler);
}
