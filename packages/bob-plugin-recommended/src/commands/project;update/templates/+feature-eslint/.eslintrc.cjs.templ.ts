import { defineTemplateFile } from '@ondrej-langr/bob';
import {
  getAstFromString,
  upsertObjectCjsExport,
} from '@ondrej-langr/bob/ast/js-ts';
import ts from 'typescript';

const { factory } = ts;

export default defineTemplateFile(
  'ts',
  (existing = getAstFromString('')) => {
    let result = existing;

    existing.getFirstToken();
    getAstFromString('');
    result = upsertObjectCjsExport(result, (statements) => {
      const identifierNameToIndex = new Map(
        statements
          .filter((statement) => ts.isPropertyAssignment(statement))
          .map((statement) => [statement.name.getText(), ''] as const),
      );

      return [...statements];
    });

    return result;
  },
);

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
                      factory.createStringLiteral(
                        'import/no-extraneous-dependencies',
                      ),
                      factory.createStringLiteral('off'),
                    ),
                    factory.createPropertyAssignment(
                      factory.createStringLiteral(
                        'unicorn/prevent-abbreviations',
                      ),
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
