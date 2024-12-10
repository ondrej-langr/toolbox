import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

export const PACKAGE_RUNTIME_ROOT = root;
export const TSURU_FOLDER_NAME = '.tsuru';
export const PNPM_WORKSPACE_YAML = 'pnpm-workspace.yaml';
export const PACKAGE_JSON = 'package.json';
