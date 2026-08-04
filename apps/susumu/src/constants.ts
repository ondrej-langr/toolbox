import type { TextProps } from '@radix-ui/themes';

const projectColors = [
  'blue',
  'green',
  'yellow',
  'orange',
  'iris',
  'jade',
  'cyan',
  'pink',
] as const satisfies ReadonlyArray<NonNullable<TextProps['color']>>;

export const getProjectColor = (
  projectId: string | null | undefined,
): TextProps['color'] => {
  if (!projectId) {
    return 'gray';
  }

  const colorIndex = Array.from(projectId).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );

  return projectColors[colorIndex % projectColors.length];
};
