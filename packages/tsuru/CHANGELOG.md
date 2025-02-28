# tsuru

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
