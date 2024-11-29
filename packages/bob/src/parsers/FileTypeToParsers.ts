import { javascriptFileTypeParser } from './javascriptFileTypeParser.js';
import { jsonFileTypeParser } from './jsonFileTypeParser.js';
import { textFileTypeParser } from './textFileTypeParser.js';
import { typescriptFileTypeParser } from './typescriptFileTypeParser.js';
import { yamlFileTypeParser } from './yamlFileTypeParser.js';

export interface FileTypeToParsers {
  js: typeof javascriptFileTypeParser;
  json: typeof jsonFileTypeParser;
  text: typeof textFileTypeParser;
  ts: typeof typescriptFileTypeParser;
  yaml: typeof yamlFileTypeParser;
}
