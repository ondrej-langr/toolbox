import ts from 'typescript';

export const doIdentifiersEqual = (
  identifier1: ts.Identifier,
  identifier2: ts.Identifier,
) =>
  identifier1.escapedText ===
  identifier2.escapedText;
