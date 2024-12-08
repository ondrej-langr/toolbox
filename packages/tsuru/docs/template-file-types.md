# About types of templates

This section explains types of templates and how to create them.

Templates can be described by two types:

- EJS templates
  - ✅ Simple templates
  - ✅ Simple usage - just create a `<result-file-name-with-extension>.ejs` file
  - ❌ Without type inference
  - ❌ Existing files are always overidden with templates outputs
- Programatically defined templates

  - ❌ Complex templates
  - ❌ Little bit of a boilerplate to get started

    - create a `<result-file-name-with-extension>.templ.ts` file
    - Define template logic with Template class and export as default

      ```ts
      import { defineTemplateFile } from 'tsuru';

      export default defineTemplateFile('json', (existing) => {
        // do magic (validation, fetching, etc...)
        // And now return what should be in the file after the template is done generating
        return {
          ...existing,
          override: 'this',
        };
      });
      ```

  - ✅ Type inference
  - ✅ Template always gets current file contents which lets it merge over existing contents of file
  - ✅ Each file type has its own parser. All parsing from or back to file handles the parser itself

## Types Of Programatically defined templates

Templates have multiple teplate types.

> Please keep in mind that Tsuru will try to write to files at the end of command, not as soon as the template file is executed.

### `text`

Reads file as is which allows for highest flexibility.

#### Usage

- With `<result-file-name-with-extension>.ejs` it is simple as it cannot hold any special logic with inputs
- With `<result-file-name-with-extension>.templ.ts` is the best for complex logic with variables

  ```js
  import { defineTemplateFile } from 'tsuru';

  export default defineTemplateFile('text', (existing) => {
    // do magic (validation, fetching, etc...)
    return `${existing}-${Date.now()}`;
  });
  ```

### `json`

Parses file contents into POJOs. It is recommended to valide its value with schema validator like [zod](https://zod.dev/)

#### Usage

- With `<result-file-name-with-extension>.templ.ts` is the best for complex logic with variables

  ```js
  import { defineTemplateFile } from 'tsuru';

  export default defineTemplateFile('json', (existing) => {
    // The return type is the same as incomming type, tsuru will take care of serialization
    return { ...existing, key: 'value' };
  });
  ```

### `yaml`

Parses YAML files contents into POJOs with [yaml](https://www.npmjs.com/package/yaml). It is recommended to valide its value with schema validator like [zod](https://zod.dev/)

#### Usage

- With `<result-file-name-with-extension>.templ.ts` is the best for complex logic with variables

  ```js
  import { defineTemplateFile } from 'tsuru';
  import { z } from 'zod';

  const schema = z.object({
    key: z.string(),
  });

  export default defineTemplateFile('yaml', (existing) => {
    const existingValidated = schema.parse(existing);

    // The return type is the same as incomming type, tsuru will take care of serialization
    return { ...existingValidated, key: 'value' };
  });
  ```

### `ts` or `js`

Parses file contents into AST with typescript. Read about it the usage [here](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

Using ASTs is most powerfull, but most intimidating at first glance. Don't let it entimidate you.

#### Usage

- With `<result-file-name-with-extension>.templ.ts` is the best for complex logic with variables

  ```js
  import { defineTemplateFile } from 'tsuru';
  import { getAstFromString } from 'tsuru/ast/js-ts';
  import ts from 'typescript';

  export default defineTemplateFile('ts', (existing) => {
    // Ts factory methods are now usable
    existing.getFirstToken();

    // Tsuru also exposes some helpful tools
    return getAstFromString('export const test = () => {};');
  });
  ```
