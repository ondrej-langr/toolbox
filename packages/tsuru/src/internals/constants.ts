import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
export const ALLOWED_COMMAND_FILE_EXTENSIONS = [
  'js',
  'ts',
  'cjs',
  'mjs',
];
export const PACKAGE_RUNTIME_ROOT = root;
export const TSURU_FOLDER_NAME = '.tsuru';
export const PNPM_WORKSPACE_YAML = 'pnpm-workspace.yaml';
export const PACKAGE_JSON = 'package.json';
export const COMMANDS_GLOB_FILE_MATCH = `{*/command.{${ALLOWED_COMMAND_FILE_EXTENSIONS.join()}},*/$*/command.{${ALLOWED_COMMAND_FILE_EXTENSIONS.join()}}}`;
export const COMMANDS_GLOB_FILE_MATCH_WITH_FOLDER = `commands/${COMMANDS_GLOB_FILE_MATCH}`;
