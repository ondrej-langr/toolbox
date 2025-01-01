import { describe, expect, it, vi } from 'vitest';

import { FileSystem } from '../../src/FileSystem';
import { TemplateFile } from '../../src/internals/TemplateFile';

vi.mock('../../src/FileSystem');

const MockedFileSystem = vi.mocked(FileSystem);

describe('TemplateFile', () => {
  it('Should handle JSON correctly when existing file is not present in file system', async () => {
    const mockedHandler = vi
      .fn()
      .mockImplementation((input) => input);
    MockedFileSystem.readFile.mockImplementation(
      async () => undefined,
    );

    const template = new TemplateFile('json', mockedHandler);

    expect(MockedFileSystem.writeFile).toHaveBeenCalledTimes(0);
    expect(mockedHandler).toHaveBeenCalledTimes(0);

    await template.writeTo('test/location.json');

    expect(MockedFileSystem.writeFile).toHaveBeenCalledTimes(1);
    expect(mockedHandler).toHaveBeenCalledWith(undefined, {
      variables: {},
    });
  });

  it('Should handle JSON correctly when existing file is present in file system', async () => {
    const mockedHandler = vi
      .fn()
      .mockImplementation((input) => input);
    MockedFileSystem.readFile.mockImplementation(
      async () => '{ "this": "that" }',
    );

    const template = new TemplateFile('json', mockedHandler);
    await template.writeTo('test/location.json');

    expect(mockedHandler).toHaveBeenCalledWith(
      {
        this: 'that',
      },
      { variables: {} },
    );
  });
});
