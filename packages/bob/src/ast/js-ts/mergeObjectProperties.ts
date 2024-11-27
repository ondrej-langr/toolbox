import ts from 'typescript';

const isTransformable = (
  node: ts.ObjectLiteralElementLike,
): node is ts.PropertyAssignment & {
  name: ts.StringLiteral | ts.Identifier;
} =>
  ts.isPropertyAssignment(node) &&
  node.name &&
  (ts.isStringLiteral(node.name) || ts.isIdentifier(node.name));

export function mergeObjectProperties(
  original: readonly ts.ObjectLiteralElementLike[],
  override: readonly ts.ObjectLiteralElementLike[],
): ts.ObjectLiteralElementLike[] {
  const resultItems = [];
  const propertyAssignments = new Map<
    string,
    ts.PropertyAssignment & {
      name: ts.StringLiteral | ts.Identifier;
    }
  >();

  // First we transform originals so we can easily know what to recursively merge or just replace
  for (const node of original) {
    if (!isTransformable(node)) {
      resultItems.push(node);

      continue;
    }

    propertyAssignments.set(node.name.getText(), node);
  }

  for (const node of override) {
    if (!isTransformable(node)) {
      resultItems.push(node);

      continue;
    }

    const existing = propertyAssignments.get(
      node.name.getText(),
    );
    if (
      !existing ||
      existing.initializer.kind !== node.initializer.kind ||
      !ts.isObjectLiteralExpression(existing.initializer) ||
      !ts.isArrayLiteralExpression(existing.initializer)
    ) {
      propertyAssignments.set(node.name.getText(), node);
    }

    // existing.
  }

  return [...resultItems, ...propertyAssignments.values()];
}
