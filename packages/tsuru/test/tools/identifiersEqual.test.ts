import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { doIdentifiersEqual } from '../../src/tools/doIdentifiersEqual';

describe('doIdentifiersEqual', () => {
  it('compares two same identifiers and results in true', () => {
    expect(
      doIdentifiersEqual(
        ts.factory.createIdentifier('hello'),
        ts.factory.createIdentifier('hello'),
      ),
    ).toBeTruthy();
  });

  it('compares two different identifiers and results in false', () => {
    expect(
      doIdentifiersEqual(
        ts.factory.createIdentifier('hello'),
        ts.factory.createIdentifier('world'),
      ),
    ).toBeFalsy();
  });
});
