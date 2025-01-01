import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defineCommand } from '../src/defineCommand';
import { getCallerFilename } from '../src/internals/getCallerFilename';

vi.mock('../src/internals/getCallerFilename');

const mockedGetCallerFilanameModule = vi.mocked(
  getCallerFilename,
);

const createCommandPath = (...paths: string[]) =>
  path.join(process.cwd(), '.tsuru', ...paths);

describe('defineCommand', () => {
  beforeEach(() => {
    mockedGetCallerFilanameModule.mockReset();
  });

  it('should correcly initialize command instance', () => {
    mockedGetCallerFilanameModule.mockReturnValue(
      createCommandPath('commands', 'my-command', 'command.ts'),
    );

    const command = defineCommand({
      description: 'test',
      handler: () => {},
    });

    expect(command.name).toBe('my-command');
    expect(command.description).toBe('test');
    expect(mockedGetCallerFilanameModule).toHaveBeenCalledOnce();
  });

  it.each([
    ['my-command/command.ts', 'my-command'],
    ['my-command/$test/command.ts', 'my-command:test'],
    ['MyCommand/command.ts', 'MyCommand'],
  ])(
    'should correcly take defined command %s and create name %s',
    (input, output) => {
      mockedGetCallerFilanameModule.mockReturnValue(
        createCommandPath('commands', input),
      );

      const command = defineCommand({
        description: 'test',
        handler: () => {},
      });

      expect(command.name).toBe(output);
    },
  );
});
