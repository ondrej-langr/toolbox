import fs from 'fs-extra';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { FileSystem } from '../src/FileSystem';

vi.mock('fs-extra', () => ({
  __esModule: true,
  default: {
    outputFile: vi.fn(),
    existsSync: vi.fn(),
  },
}));

vi.mock(
  '../src/utils/getProgramOptions.ts',
  () => ({
    __esModule: true,
    getProgramOptions: vi.fn(),
  }),
);

const mockedOutputFile = vi.mocked(fs.outputFile);
const mockedFsExistsSync = vi.mocked(
  fs.existsSync,
);

describe('FileSystem', () => {
  beforeEach(() => {
    mockedFsExistsSync.mockReturnValue(false);
  });

  afterEach(() => {
    mockedOutputFile.mockClear();
  });

  it('does not commit until commit(...) is called', async () => {
    mockedOutputFile.mockImplementation(() =>
      Promise.resolve(true),
    );

    FileSystem.writeFile(
      '/this/is/absolute/path.ts',
      'console.log("hello")',
    );
    expect(mockedOutputFile).not.toBeCalled();
    await FileSystem.commit();
    expect(mockedOutputFile).toBeCalledTimes(1);
  });
});
