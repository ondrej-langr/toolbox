import { z } from 'zod';

const PROJECT_NAME_REGEX_PART = String.raw`([a-z]|-|[1-9]|\.)+`;
const PROJECT_NAME_REGEX = new RegExp(
  `^(@${PROJECT_NAME_REGEX_PART}/)?${PROJECT_NAME_REGEX_PART}$`,
);
const MAX_NUMBER_OF_CHARS_NPM = 214;

export const projectNameSchema = z
  .string()
  .min(1)
  // This is maximum number of chars that npm can take
  .max(MAX_NUMBER_OF_CHARS_NPM)
  .refine(
    (input) => PROJECT_NAME_REGEX.test(input),
    (got) => ({
      message: `Invalid project name "${got}". Project name or preject name prefix must only include lowercase letters, numbers, dash or dot`,
    }),
  );
