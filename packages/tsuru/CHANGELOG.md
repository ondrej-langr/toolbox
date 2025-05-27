# tsuru

## 0.8.0

### Minor Changes

- [`7b89ef3`](https://github.com/ondrej-langr/toolbox/commit/7b89ef3304f495558c58de4858175e89b9b6e9fb) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: tsuru/schema was moved to @ondrej-langr/zod-package-json and tsuru/ast/json + tsuru/ast/js-ts was moved to tsuru/tools. Functionality is unchanged

### Patch Changes

- Updated dependencies [[`7b89ef3`](https://github.com/ondrej-langr/toolbox/commit/7b89ef3304f495558c58de4858175e89b9b6e9fb)]:
  - @ondrej-langr/zod-package-json@0.1.0

## 0.7.0

### Minor Changes

- [#10](https://github.com/ondrej-langr/toolbox/pull/10) [`82898e2`](https://github.com/ondrej-langr/toolbox/commit/82898e2dd2f8592e78def8ac2df64d82d18ae3da) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Extends variety for exports key value. Each export can now include specific types for different types of exports

### Patch Changes

- [#10](https://github.com/ondrej-langr/toolbox/pull/10) [`82898e2`](https://github.com/ondrej-langr/toolbox/commit/82898e2dd2f8592e78def8ac2df64d82d18ae3da) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Fixes dual build packages by structuring the exports differently and providing types for each export type separately

## 0.6.0

### Minor Changes

- [`11be3f2`](https://github.com/ondrej-langr/toolbox/commit/11be3f26451503713e5d2a15004ec8da711cbe89) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - POSSIBLE BREAKING: Allows tsuru to be consumed in esm and cjs by building dual builds

- [`7b4619c`](https://github.com/ondrej-langr/toolbox/commit/7b4619c64a659297855324ebd5ae6ba6ab3589d7) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Makes type property in package.json optional without default value

- [`9eb4cba`](https://github.com/ondrej-langr/toolbox/commit/9eb4cbaf94e0925752eae817d68bee52143510c1) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Creates new exceptions and makes all methods, except commit, in FileSystem sync instead of async

### Patch Changes

- [`b689a0f`](https://github.com/ondrej-langr/toolbox/commit/b689a0f36ac5820f3c0f9c3a8bcda7358ec74380) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Removes unused dependencies

## 0.5.3

### Patch Changes

- [`2d7ec24`](https://github.com/ondrej-langr/toolbox/commit/2d7ec24924100493c39a868556f9d1ea0fa662e6) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Moves @types/inquirer into normal dependencies as types are needed when using tsuru as a library

## 0.5.2

### Patch Changes

- [`e6703e4`](https://github.com/ondrej-langr/toolbox/commit/e6703e43f8c04cbe532506cfd08e0cee98e7defe) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Prevents committing files from virtual file system onto disc when file was not changed with tsuru

## 0.5.1

### Patch Changes

- [`c4e9fef`](https://github.com/ondrej-langr/toolbox/commit/c4e9fefba892030f0902e1b290c559c2176b8d4d) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Fixes setting of program name

## 0.5.0

### Minor Changes

- [`e25b120`](https://github.com/ondrej-langr/toolbox/commit/e25b1203870cb5ad62ccc0079694eda4b3bcf31a) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Logger is now exposed on program itself and removed from command. This command now also takes its name after program name itself

- [`84a7626`](https://github.com/ondrej-langr/toolbox/commit/84a7626752375852d9c359df0a26827b654a6eed) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Exposes logger from package. This allows users to create their own logger by importing the `createLogger` function from `tsuru/logger`.

## 0.4.0

### Minor Changes

- [`673b861`](https://github.com/ondrej-langr/toolbox/commit/673b861833feab22cd37ab4c4dfb3570c3cbe8b4) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Makes program constructor options required and adds more properties to define program with

## 0.3.0

### Minor Changes

- [`abd850f`](https://github.com/ondrej-langr/toolbox/commit/abd850fc58aeb24126cc772a192b624d824ae6fc) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Exports program from `tsuru` which allows for a way to create custom program and not rely on tsuru to orchestrate commands. This means users can create their own command line programs with the help of tsuru.

## 0.2.3

### Patch Changes

- [`3248f95`](https://github.com/ondrej-langr/toolbox/commit/3248f95cad6bc697d0e72a9f38d58798f64e0798) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Fixes invalid applyPackageJsonTemplate functionality where version were ont correctly checked against template defined versions.

## 0.2.2

### Patch Changes

- [#9](https://github.com/ondrej-langr/toolbox/pull/9) [`c7ca2fb`](https://github.com/ondrej-langr/toolbox/commit/c7ca2fb2690a698d49c2b5e414c505dc0a9106b8) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Fixes logging messages by placing tsuru as a message prefix instead of the message type

- [#9](https://github.com/ondrej-langr/toolbox/pull/9) [`c7ca2fb`](https://github.com/ondrej-langr/toolbox/commit/c7ca2fb2690a698d49c2b5e414c505dc0a9106b8) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Adds external .ts loader for cosmiconfig. This should improve the stability of typescript configs and commands.

## 0.2.1

### Patch Changes

- [`9b99e9f`](https://github.com/ondrej-langr/toolbox/commit/9b99e9f7586191b6f3f8410e199f7e7126a008fc) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Adds exact return type to applyPackageJsonTemplate

## 0.2.0

### Minor Changes

- [`5153bfe`](https://github.com/ondrej-langr/toolbox/commit/5153bfe8ffb67719c11bc421bc48e67aba2a43f1) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Adds `applyPackageJsonTemplate` utility to `tsuru/ast/json`. This utility merges defined package.json template and takes into consideration the version rules defined in templates.

- [`d257f89`](https://github.com/ondrej-langr/toolbox/commit/d257f89bb102e58fdc6c38d877db479728c3d7d2) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Renames BOB_FOLDER_NAME to TSURU_FOLDER_NAME.

- [`e05e5c7`](https://github.com/ondrej-langr/toolbox/commit/e05e5c7e732bf2a25aa600990ea15aecf6d20cd1) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Marks handler as required and questions as optional

- [`5153bfe`](https://github.com/ondrej-langr/toolbox/commit/5153bfe8ffb67719c11bc421bc48e67aba2a43f1) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Introduces json ast utils. To import them use `tsuru/ast/json` export.

- [`75be920`](https://github.com/ondrej-langr/toolbox/commit/75be920a2c3849889a36f5d572bb8af59fc0aeb2) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Improves command definition with "$" syntax. Commands now can be defined in groups. For example creating `commands/my-command/$build/command.ts`results in`my-command:build` command.

- [`b05e53f`](https://github.com/ondrej-langr/toolbox/commit/b05e53f4ce5fdd436eca4f7878f7336e2feace86) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Removes jsonSchema and Json type and instead introduces jsonLikeObjectSchema and JsonLikeObject as a replacement. Underlying logic relies mainly that top JSON values are always objects instead of sometimes being literals. This way the type definition can be cleaner and more reasonable to end users.

### Patch Changes

- [`2603e34`](https://github.com/ondrej-langr/toolbox/commit/2603e34ffb00728f6d812a591ecc35f674adb496) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Improves logging of actions that tsuru makes

- [`96ba2f2`](https://github.com/ondrej-langr/toolbox/commit/96ba2f29f966e6e1ca4df76ace56ce76b182f0a6) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Improves loading of commands, configs and templates. They can now be defined under ts, js, cjs and mjs extensions and don't need to be precompiled! Everything is handled for you.

- [`e05e23d`](https://github.com/ondrej-langr/toolbox/commit/e05e23d23d894a569907e585cefdd04d8183bf6a) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - POSSIBLE BREAKING: Fixing and stabilizing types

## 0.1.0

### Minor Changes

- [#4](https://github.com/ondrej-langr/toolbox/pull/4) [`7c8fa14`](https://github.com/ondrej-langr/toolbox/commit/7c8fa140809cfec4a17b13362155f61a77135580) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Introduces package. Tsuru is a package that allows users to manage their new or existing projects with ease with the help of project orchestration, templates and ASTs.

  Users can create commands in active projects, workspaces or projects in active workspaces to manage their contents with templates. Users can also create plugins to share commands with multiple projects that do not live in the same repository or in the same company.
