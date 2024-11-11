import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import * as prettier from 'prettier';
import type { z } from 'zod';

import { logger } from './internals/logger.js';
import type { JsonPartial } from './schemas/jsonSchema.js';

/**
Wrapper around fs-extra that batches update of files until they are committed
*/
export class FileSystem {
  private static cache = new Map<string, string>();

  static readonly cacheless = fs;

  // TODO: filePath must be absolute
  static async readFile(absoluteFilePath: string): Promise<string | undefined> {
    let result = this.cache.get(absoluteFilePath);

    if (result) {
      return result;
    }

    if ((await fs.exists(absoluteFilePath)) === false) {
      return undefined;
    }

    result = await fs.readFile(absoluteFilePath, { encoding: 'utf8' });
    this.cache.set(absoluteFilePath, result);

    return result;
  }

  static findFile(filename: string, options: { cwd: string }) {
    if (!filename) {
      return null;
    }

    const test = (folderName: string): string | undefined => {
      const filepath = path.join(folderName, filename);
      const absoluteFilepath = path.isAbsolute(filepath)
        ? filepath
        : path.join('/', filepath);
      const exists = this.existsSync(absoluteFilepath);

      if (!exists) {
        return undefined;
      }

      return filepath;
    };

    const cwdAsArray = (options.cwd ?? process.cwd()).split(path.sep);
    let index = cwdAsArray.length;
    while (index--) {
      const filePath = test(cwdAsArray.join(path.sep));

      if (filePath) {
        return filePath;
      }

      cwdAsArray.pop();
    }

    return null;
  }

  static async readJson<S extends z.ZodObject<any> | z.ZodRecord>(
    absoluteFilePath: string,
    options: {
      reviver?: (key: string, value: any) => any;
      schema: S;
    },
  ): Promise<z.output<S> | undefined> {
    const content = await this.readFile(absoluteFilePath);

    if (!content) {
      return undefined;
    }

    let result;
    try {
      result = JSON.parse(content, options.reviver);
    } catch (error) {
      if (error instanceof Error) {
        error.message = `Failed to parse JSON file ${absoluteFilePath}: ${error.message}`;
      }

      throw error;
    }

    return options.schema.parseAsync(result);
  }

  static existsSync(absoluteFilePath: string) {
    const exists = this.cache.has(absoluteFilePath) || fs.existsSync(absoluteFilePath);
    logger.debug(`Checking if file ${absoluteFilePath} exists: ${exists ? '✅' : '❌'}`);
    return exists;
  }

  static async exists(absoluteFilePath: string) {
    const exists =
      this.cache.has(absoluteFilePath) || (await fs.exists(absoluteFilePath));
    logger.debug(`Checking if file ${absoluteFilePath} exists: ${exists ? '✅' : '❌'}`);
    return exists;
  }

  static writeFile(absoluteFilePath: string, value: string) {
    logger.debug(`Registering text file for write ${absoluteFilePath}`);
    this.cache.set(absoluteFilePath, value);
  }

  static writeJson(absoluteFilePath: string, value: JsonPartial) {
    this.writeFile(absoluteFilePath, JSON.stringify(value, null, 2));
  }

  static async writeTempFile(fileName: string, value: string) {
    const temporaryDirectory = path.resolve(await fs.realpath(os.tmpdir()));

    // TODO: add check for fileName that it does not include path instead of filename
    const temporaryFilepath = path.join(temporaryDirectory, fileName);
    await fs.outputFile(fileName, value);

    return { filepath: temporaryFilepath };
  }

  /**
  Commits all batched updates for selected files
  */
  static commit(paths: string[]): Promise<void>;

  /**
  Commits updates to one selected file
  */
  static commit(path: string): Promise<void>;

  /**
  Commits all batched updates
  */
  static commit(): Promise<void>;

  static async commit(pathOrPaths?: string[] | string) {
    logger.debug('Commiting files from memory');
    const keys = [
      ...(Array.isArray(pathOrPaths)
        ? pathOrPaths
        : pathOrPaths
          ? [pathOrPaths]
          : this.cache.keys()),
    ].sort((a, b) => {
      const depthA = a.split(path.sep).length;
      const depthB = b.split(path.sep).length;

      return depthA > depthB ? 1 : depthA === depthB ? 0 : -1;
    });

    let resolvedPrettierConfig: prettier.Options | null = null;

    const deepestFilePath = keys.at(-1);
    if (deepestFilePath) {
      const prettierFilename = 'prettier.config.js';
      const prettierConfigFile = FileSystem.findFile(prettierFilename, {
        cwd: path.dirname(deepestFilePath),
      });
      const prettierFileContents = prettierConfigFile
        ? await FileSystem.readFile(prettierConfigFile)
        : null;

      if (prettierFileContents) {
        const { filepath: prettierTemporaryFilepath } = await this.writeTempFile(
          prettierFilename,
          prettierFileContents,
        );
        resolvedPrettierConfig = await prettier.resolveConfig(prettierTemporaryFilepath);
      }
    }

    const writesAsPromises: Promise<any>[] = [];
    for (const key of keys) {
      const value = this.cache.get(key);

      if (value === undefined) {
        continue;
      }

      writesAsPromises.push(
        (async () => {
          let formattedValue = value;

          // Ignore initial prettierignore that does not need to be formatted
          if (path.basename(key) !== '.prettierignore') {
            logger.debug(`Formatting file ${key}`);
            try {
              formattedValue = await prettier.format(value, {
                ...resolvedPrettierConfig,
                filepath: key,
              });
            } catch {
              logger.debug(`Failed to format ${key}`);
            }
          }

          logger.debug(`Writing file ${key}`);
          await fs.outputFile(key, formattedValue, { encoding: 'utf8' });

          this.cache.delete(key);
        })(),
      );
    }

    await Promise.all(writesAsPromises);
  }
}
