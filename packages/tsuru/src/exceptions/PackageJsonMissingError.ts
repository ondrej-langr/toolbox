import { PACKAGE_JSON } from '../internals/constants.js';

export class PackageJsonMissingError extends Error {
  constructor(readonly projectPath: string) {
    super(
      `Invalid package at ${projectPath} - the ${PACKAGE_JSON} is missing`,
    );
  }
}
