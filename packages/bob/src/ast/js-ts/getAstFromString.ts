import ts from 'typescript';

export const getAstFromString = (
  statementString: string,
) =>
  ts.createSourceFile(
    'temp.tsx',
    statementString,
    ts.ScriptTarget.Latest,
  );
