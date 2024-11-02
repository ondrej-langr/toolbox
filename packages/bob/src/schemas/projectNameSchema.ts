import { z } from 'zod';

const PROJECT_NAME_REGEX_PART = '([a-z]|-|[1-9]|\\.)+';
const PROJECT_NAME_REGEX = new RegExp(`^(@${PROJECT_NAME_REGEX_PART}\/)?${PROJECT_NAME_REGEX_PART}$`);

export const projectNameSchema = z
  .string()
  .min(1)
  // This is maximum number of chars that npm can take
  .max(214)
  .refine(
    (input) => PROJECT_NAME_REGEX.test(input),
    (got) => ({
      message: `Invalid project name "${got}". Project name or preject name prefix must only include lowercase letters, numbers, dash or dot`,
    }),
  );
