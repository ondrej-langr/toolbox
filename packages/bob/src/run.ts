// -- Import commands
import { glob } from 'glob';
import path from 'path';

import { FileSystem } from './FileSystem.js';
import { PACKAGE_RUNTIME_ROOT } from './constants.js';
import { program } from './program.js';

// In the future we would like to find current project/workspace and register
// commands defined there!
const commandRegisterPaths = await glob(path.join(PACKAGE_RUNTIME_ROOT, 'commands', '*', 'command.js'));
const moduleImportsAsPromise: Promise<any>[] = [];
for (const commandPath of commandRegisterPaths) {
  moduleImportsAsPromise.push(import(commandPath));
}
await Promise.all(moduleImportsAsPromise);

try {
  // Start program
  await program.parseAsync();

  // TODO: create a local pull request for written files when appropriate action turns that on
  // Commit all files in one go
  await FileSystem.commit();
} catch (error) {
  // TODO: Improve debugging
  console.trace({ error });

  process.exit(1);
}
