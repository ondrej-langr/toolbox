// -- Import commands
import { glob } from 'glob';
import path from 'node:path';

import { PACKAGE_RUNTIME_ROOT } from './constants/base.js';
import { program } from './constants/program.js';
import { FileSystem } from './FileSystem.js';
import type { Json } from './schemas/jsonSchema.js';
import type { ProgramOptions } from './types/ProgramOptions.js';
import { log } from './utils/log.js';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var cachedProgramOptions: ProgramOptions;
}

global.cachedProgramOptions = program.opts<ProgramOptions>();
if (global.cachedProgramOptions.debug) {
  log.debug('Registered program options', global.cachedProgramOptions as unknown as Json);
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
