import { describe, expect, it } from 'vitest';

import { packageJsonSchema } from '../../src/schemas/packageJsonSchema';

describe('packageJsonSChema', () => {
  it('should validate minimal package json', () => {
    expect(
      packageJsonSchema.safeParse({
        name: 'package-name',
        description: 'This is my package description',
      }).success,
    ).toBeTruthy();
  });

  it('should pass through unknown values', () => {
    expect(
      packageJsonSchema.safeParse({
        name: 'package-name',
        description: 'This is my package description',
        first: 'it',
        second: {
          normalString: 'life',
          withBoolean: true,
          withNumber: 1,
        },
      }).data,
    ).toStrictEqual({
      name: 'package-name',
      description: 'This is my package description',
      first: 'it',
      type: 'module',
      license: 'MIT',
      engines: {},
      second: {
        normalString: 'life',
        withBoolean: true,
        withNumber: 1,
      },
    });
  });
});
