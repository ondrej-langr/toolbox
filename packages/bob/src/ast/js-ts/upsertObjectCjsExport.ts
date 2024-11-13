import ts from 'typescript';

import { getAstFromString } from './getAstFromString.js';

const isIdentifierWithContent = (
  node: ts.Node,
  text: ts.__String | string,
) =>
  ts.isIdentifier(node) &&
  node.escapedText === text;
function findObjectVariableDeclarationByName(
  node: ts.VariableStatement,
  name: ts.__String | string,
) {
  return node.declarationList.declarations.find(
    (declaration) =>
      isIdentifierWithContent(
        declaration.name,
        name,
      ) &&
      declaration?.initializer &&
      ts.isObjectLiteralExpression(
        declaration.initializer,
      ),
  );
}

function createEmptyCjsExport(): ts.ExpressionStatement {
  const [statement] = getAstFromString(
    `module.exports = {};`,
  ).statements;

  if (
    !statement ||
    !ts.isExpressionStatement(statement)
  ) {
    throw new Error(
      'getStatementsFromString function returned invalid output',
    );
  }

  return statement;
}

function isCjsExport(
  statement: ts.Statement,
): statement is ts.ExpressionStatement & {
  expression: ts.BinaryExpression & {
    left: ts.PropertyAccessExpression;
  };
} {
  if (
    !ts.isExpressionStatement(statement) ||
    !ts.isBinaryExpression(statement.expression)
  ) {
    return false;
  }

  const { expression } = statement;

  // Check if its "module.exports = "
  if (
    !ts.isPropertyAccessExpression(
      expression.left,
    ) ||
    !isIdentifierWithContent(
      expression.left.expression,
      'module',
    ) ||
    !isIdentifierWithContent(
      expression.left.name,
      'exports',
    ) ||
    expression.operatorToken.kind !==
      ts.SyntaxKind['EqualsToken']
  ) {
    return false;
  }

  return true;
}

function isCjsExportWithAnonymousObject(
  statement: ts.Statement,
): statement is ts.ExpressionStatement & {
  expression: ts.BinaryExpression & {
    left: ts.PropertyAccessExpression;
    right: ts.ObjectLiteralExpression;
  };
} {
  return (
    isCjsExport(statement) &&
    ts.isObjectLiteralExpression(
      statement.expression.right,
    )
  );
}

function getCjsExportIndex(file: ts.SourceFile) {
  let index = 0;
  for (const statement of file.statements) {
    index++;
    if (!isCjsExport(statement)) {
      continue;
    }

    const { expression } = statement;
    // if the exports value is object then just say its correct
    if (
      ts.isObjectLiteralExpression(
        expression.right,
      )
    ) {
      return index - 1;
    }

    // If its not variable reference then end
    if (!ts.isIdentifier(expression.right)) {
      continue;
    }

    const { escapedText: variableName } =
      expression.right;
    const referencedExportsVariableIndex =
      file.statements.findIndex(
        (otherStatement) =>
          ts.isVariableStatement(
            otherStatement,
          ) &&
          findObjectVariableDeclarationByName(
            otherStatement,
            variableName,
          ),
      );

    if (referencedExportsVariableIndex === -1) {
      continue;
    }

    return referencedExportsVariableIndex;
  }

  return -1;
}

// TODO: modify also when something extends
// module.exports = require(...)
export function upsertObjectCjsExport(
  file: ts.SourceFile,
  callback: (
    existingStatements: ts.NodeArray<ts.ObjectLiteralElementLike>,
  ) => ts.ObjectLiteralElementLike[],
) {
  let outcommingFile = file;
  let exportsValueIndex = getCjsExportIndex(file);

  if (exportsValueIndex === -1) {
    // Add new cjs export, its either missing or we dont support such expression
    outcommingFile = ts.factory.updateSourceFile(
      outcommingFile,
      [
        ...outcommingFile.statements,
        createEmptyCjsExport(),
      ],
    );
    exportsValueIndex =
      outcommingFile.statements.length - 1;
  }

  outcommingFile = ts.factory.updateSourceFile(
    outcommingFile,
    outcommingFile.statements.map(
      (statement, index) => {
        if (index === exportsValueIndex) {
          // module.exports = { ... }
          if (
            isCjsExportWithAnonymousObject(
              statement,
            )
          ) {
            const objectValue =
              ts.factory.updateObjectLiteralExpression(
                statement.expression.right,
                callback(
                  statement.expression.right
                    .properties,
                ),
              );

            return ts.factory.updateExpressionStatement(
              statement,
              ts.factory.updateBinaryExpression(
                statement.expression,
                statement.expression.left,
                statement.expression
                  .operatorToken,
                objectValue,
              ),
            );
          }
          // variable used as default export
          else if (
            ts.isVariableStatement(statement)
          ) {
            const [declaration] =
              statement.declarationList
                .declarations;

            if (
              !declaration ||
              !declaration.initializer ||
              !ts.isObjectLiteralExpression(
                declaration.initializer,
              )
            ) {
              throw new Error(
                'Not a correct variable declaration',
              );
            }

            return ts.factory.updateVariableStatement(
              statement,
              statement.modifiers,
              ts.factory.createVariableDeclarationList(
                [
                  ts.factory.updateVariableDeclaration(
                    declaration,
                    declaration.name,
                    declaration.exclamationToken,
                    declaration.type,
                    ts.factory.updateObjectLiteralExpression(
                      declaration.initializer,
                      callback(
                        declaration.initializer
                          .properties,
                      ),
                    ),
                  ),
                ],
                statement.declarationList.flags,
              ),
            );
          }
        }

        return statement;
      },
    ),
  );

  return outcommingFile;
}
