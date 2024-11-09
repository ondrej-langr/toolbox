import ts from 'typescript';

import { packageJsonSchema } from '../../../../schemas/packageJsonSchema.js';
import { TemplateFile } from '../../../../TemplateFile.js';
import { getAstFromString } from '../../../../utils/ast/getAstFromString.js';
import { upsertObjectCjsExport } from '../../../../utils/ast/upsertObjectCjsExport.js';

const { factory } = ts;

export default TemplateFile.define('ts', (existing = getAstFromString('')) => {
  let result = existing;

  result = upsertObjectCjsExport(result, (statements) => {
    const identifierNameToIndex = new Map(
      statements
        .filter((statement) => ts.isPropertyAssignment(statement))
        .map((statement) => [statement.name.getText(), ''] as const),
    );

    console.log();

    return [...statements];
  });

  return result;
});

factory.createObjectLiteralExpression(
  [
    factory.createPropertyAssignment(
      factory.createIdentifier('extends'),
      factory.createArrayLiteralExpression(
        [factory.createStringLiteral('@apitree.cz')],
        false,
      ),
    ),
    factory.createPropertyAssignment(
      factory.createIdentifier('parserOptions'),
      factory.createObjectLiteralExpression(
        [
          factory.createPropertyAssignment(
            factory.createIdentifier('project'),
            factory.createStringLiteral('tsconfig.json'),
          ),
          factory.createPropertyAssignment(
            factory.createIdentifier('tsconfigRootDir'),
            factory.createIdentifier('__dirname'),
          ),
        ],
        true,
      ),
    ),
    factory.createPropertyAssignment(
      factory.createIdentifier('root'),
      factory.createTrue(),
    ),
    factory.createPropertyAssignment(
      factory.createIdentifier('overrides'),
      factory.createArrayLiteralExpression(
        [
          factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                factory.createIdentifier('files'),
                factory.createArrayLiteralExpression(
                  [
                    factory.createStringLiteral('**/*.e2e.ts'),
                    factory.createStringLiteral('**/*.e2e.tsx'),
                    factory.createStringLiteral('**/*.test.ts'),
                    factory.createStringLiteral('**/*.test.tsx'),
                    factory.createStringLiteral('playwright.config.ts'),
                  ],
                  true,
                ),
              ),
              factory.createPropertyAssignment(
                factory.createIdentifier('rules'),
                factory.createObjectLiteralExpression(
                  [
                    factory.createPropertyAssignment(
                      factory.createStringLiteral('import/no-extraneous-dependencies'),
                      factory.createStringLiteral('off'),
                    ),
                    factory.createPropertyAssignment(
                      factory.createStringLiteral('unicorn/prevent-abbreviations'),
                      factory.createStringLiteral('off'),
                    ),
                  ],
                  true,
                ),
              ),
            ],
            true,
          ),
        ],
        true,
      ),
    ),
  ],
  true,
);