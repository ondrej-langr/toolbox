import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PACKAGE_RUNTIME_ROOT = __dirname;
export const PNPM_WORKSPACE_YAML = 'pnpm-workspace.yaml';
export const PACKAGE_JSON = 'package.json';
export const DEFAULT_NODE_VERSION = 20;
export const DEFAULT_PNPM_VERSION = 8;
