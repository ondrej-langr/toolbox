import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { getAstFromString } from '../../../src/ast/js-ts/getAstFromString';
import { getStringFromAstNode } from '../../../src/ast/js-ts/getStringFromAstNode';
import { upsertObjectCjsExport } from '../../../src/ast/js-ts/upsertObjectCjsExport';

describe('upsertObjectCjsExport', () => {
  it('should create default export with data', () => {
    const existingContent = upsertObjectCjsExport(
      getAstFromString(`const hello = 'world';`),
      (statements) => {
        return [
          ...statements,
          // Add some properties
          ts.factory.createPropertyAssignment(
            'root',
            ts.factory.createTrue(),
          ),
        ];
      },
    );

    expect(getStringFromAstNode(existingContent))
      .toMatchInlineSnapshot(`
      "const hello = "world";
      module.exports = { root: true };
      "`);
  });

  it('should reuse existing export anonymous object', () => {
    const existingContent = upsertObjectCjsExport(
      getAstFromString(`
        const hello = 'world';
        module.exports = {
          my: 'World'
        }
      `),
      (statements) => {
        return [
          ...statements,
          // Add some properties
          ts.factory.createPropertyAssignment(
            'root',
            ts.factory.createTrue(),
          ),
        ];
      },
    );

    expect(getStringFromAstNode(existingContent))
      .toMatchInlineSnapshot(`
      "const hello = "world";
      module.exports = {
          my: "World",
          root: true
      };
      "`);
  });

  it('should reuse existing export object from variable', () => {
    const existingContent = upsertObjectCjsExport(
      getAstFromString(`
        const hello = 'world';
        const exportVariable = {
          my: 'World',
          hello: () => "this is it"
        };
        module.exports = exportVariable;
      `),
      (statements) => {
        return [
          ...statements,
          // Add some properties
          ts.factory.createPropertyAssignment(
            'root',
            ts.factory.createTrue(),
          ),
        ];
      },
    );

    expect(getStringFromAstNode(existingContent))
      .toMatchInlineSnapshot(`
      "const hello = "world";
      const exportVariable = {
          my: "World",
          hello: () => "this is it",
          root: true
      };
      module.exports = exportVariable;
      "`);
  });

  it('should ignore invalid export definition and create new one', () => {
    const existingContent = upsertObjectCjsExport(
      getAstFromString(`const hello = 'world';
        module.exports = null;
        `),
      (statements) => {
        return [
          ...statements,
          // Add some properties
          ts.factory.createPropertyAssignment(
            'root',
            ts.factory.createTrue(),
          ),
        ];
      },
    );

    expect(getStringFromAstNode(existingContent))
      .toMatchInlineSnapshot(`
      "const hello = "world";
      module.exports = null;
      module.exports = { root: true };
      "`);
  });
});
