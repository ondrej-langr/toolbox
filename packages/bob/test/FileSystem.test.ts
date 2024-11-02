import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FileSystem } from '../src/FileSystem';

vi.mock('fs-extra', () => ({
  __esModule: true,
  default: {
    outputFile: vi.fn(),
  },
}));

const mockedOutputFile = vi.mocked(fs.outputFile);

describe('FileSystem', () => {
  afterEach(() => {
    mockedOutputFile.mockClear();
  });

  it('does not commit until commit(...) is called', async () => {
    mockedOutputFile.mockImplementation(() => Promise.resolve(true));

    FileSystem.writeFile('/this/is/absolute/path.ts', 'console.log("hello")');
    expect(mockedOutputFile).not.toBeCalled();
    await FileSystem.commit();
    expect(mockedOutputFile).toBeCalledTimes(1);
  });
});
