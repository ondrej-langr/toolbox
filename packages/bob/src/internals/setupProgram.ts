import { Command } from 'commander';
import path from 'node:path';

import { Project } from '../Project.js';

import { PACKAGE_RUNTIME_ROOT } from './constants.js';

export async function setupProgram() {
  const program = new Command();
  const bobPackage = await Project.loadAt(
    path.join(PACKAGE_RUNTIME_ROOT, '..'),
  );
  const bobPackageJson = bobPackage.getPackageInfo();

  program
    .name(bobPackageJson.name)
    .description(bobPackageJson.description)
    .version(bobPackageJson.version ?? 'unknown')
    .option(
      '-c, --cwd <value>',
      'Define cwd for commands, defaults to cwd that this cli application is executed from',
      (passedValue) =>
        path.isAbsolute(passedValue)
          ? passedValue
          : path.join(process.cwd(), passedValue),
      process.cwd(),
    )
    .option(
      '-d, --debug',
      'If true it enables logging debug messages',
      false,
    );

  return program;
}
