import ts from 'typescript';

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

export function getStringFromAstNode(
  node: ts.Node,
) {
  const file = ts.createSourceFile(
    'temp.tsx',
    node.getText(),
    ts.ScriptTarget.Latest,
  );
  return printer.printNode(
    ts.EmitHint.Unspecified,
    node,
    file,
  );
}
