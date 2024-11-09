// -- Import commands
import { glob } from 'glob';
import path from 'node:path';

import { FileSystem } from './FileSystem.js';
import { PACKAGE_RUNTIME_ROOT } from './internals/constants.js';
import { logger } from './internals/logger.js';
import { program } from './internals/program.js';
import { ProgramOptions } from './ProgramOptions.js';
import type { Json } from './schemas/jsonSchema.js';

global.cachedProgramOptions = program.opts<ProgramOptions>();
if (global.cachedProgramOptions.debug) {
  logger.debug(
    'Registered program options',
    global.cachedProgramOptions as unknown as Json,
  );
}

// In the future we would like to find current project/workspace and register
// commands defined there!
const commandRegisterPaths = await glob(
  path.join(PACKAGE_RUNTIME_ROOT, 'commands', '*', 'command.js'),
);
const moduleImportsAsPromise: Promise<unknown>[] = [];
for (const commandPath of commandRegisterPaths) {
  moduleImportsAsPromise.push(import(commandPath));
}
await Promise.all(moduleImportsAsPromise);

// Start program
await program.parseAsync();

// TODO: create a local pull request for written files when appropriate action turns that on
// Commit all files in one go
await FileSystem.commit();
