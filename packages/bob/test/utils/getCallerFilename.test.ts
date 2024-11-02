import { describe, it, expect } from 'vitest';

import { getCallerFilename } from '../../src/utils/getCallerFilename';

function testingFunction() {
  const caller = getCallerFilename();

  return caller;
}

describe('getCallerFilename', () => {
  it('should correctly resolve caller in function', () => {
    expect(testingFunction().endsWith('getCallerFilename.test.ts')).to.be.true;
  });
});
