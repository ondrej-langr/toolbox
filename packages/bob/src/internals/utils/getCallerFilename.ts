import url from 'node:url';

/**
 * Gets caller filename of function that this function is used in
 */
export function getCallerFilename() {
  const error = new Error();

  Error.prepareStackTrace = (_, stack) => stack;

  const stack =
    error.stack as unknown as NodeJS.CallSite[];

  Error.prepareStackTrace = undefined;

  const callerFilename = stack[2]?.getFileName();

  if (!callerFilename) {
    throw new Error(
      'Cannot get caller filename of called function from callstack',
    );
  }

  return callerFilename.startsWith('file://')
    ? url.fileURLToPath(callerFilename)
    : callerFilename;
}
