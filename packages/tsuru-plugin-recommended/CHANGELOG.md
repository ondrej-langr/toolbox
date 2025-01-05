# tsuru-plugin-recommended

## 0.1.2

### Patch Changes

- Updated dependencies [[`9b99e9f`](https://github.com/ondrej-langr/toolbox/commit/9b99e9f7586191b6f3f8410e199f7e7126a008fc)]:
  - tsuru@0.2.1

## 0.1.1

### Patch Changes

- [`e7f1895`](https://github.com/ondrej-langr/toolbox/commit/e7f1895d51adf00d0898e198be1d2b7438666513) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Removes webpack-merge from dependencies as es-toolkit is used instead

- [`e05e23d`](https://github.com/ondrej-langr/toolbox/commit/e05e23d23d894a569907e585cefdd04d8183bf6a) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - POSSIBLE BREAKING: Fixing and stabilizing types

- Updated dependencies [[`5153bfe`](https://github.com/ondrej-langr/toolbox/commit/5153bfe8ffb67719c11bc421bc48e67aba2a43f1), [`d257f89`](https://github.com/ondrej-langr/toolbox/commit/d257f89bb102e58fdc6c38d877db479728c3d7d2), [`e05e5c7`](https://github.com/ondrej-langr/toolbox/commit/e05e5c7e732bf2a25aa600990ea15aecf6d20cd1), [`2603e34`](https://github.com/ondrej-langr/toolbox/commit/2603e34ffb00728f6d812a591ecc35f674adb496), [`96ba2f2`](https://github.com/ondrej-langr/toolbox/commit/96ba2f29f966e6e1ca4df76ace56ce76b182f0a6), [`5153bfe`](https://github.com/ondrej-langr/toolbox/commit/5153bfe8ffb67719c11bc421bc48e67aba2a43f1), [`e05e23d`](https://github.com/ondrej-langr/toolbox/commit/e05e23d23d894a569907e585cefdd04d8183bf6a), [`75be920`](https://github.com/ondrej-langr/toolbox/commit/75be920a2c3849889a36f5d572bb8af59fc0aeb2), [`b05e53f`](https://github.com/ondrej-langr/toolbox/commit/b05e53f4ce5fdd436eca4f7878f7336e2feace86)]:
  - tsuru@0.2.0

## 0.1.0

### Minor Changes

- [#4](https://github.com/ondrej-langr/toolbox/pull/4) [`7c8fa14`](https://github.com/ondrej-langr/toolbox/commit/7c8fa140809cfec4a17b13362155f61a77135580) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Introduces package. This is a plugin that helps to manage ondrej-langr workspace and helps users to understand how Tsuru works.

  This Plugin has following commands:

  - `workspace:create` - creates workspace, throws if command is executed in workspace
  - `workspace:update` - updates workspace with active settings with latest templates
  - `project:create` - creates new project in current workspace or in current working directory
  - `project:update` - updates project with active settings with latest templates

### Patch Changes

- Updated dependencies [[`7c8fa14`](https://github.com/ondrej-langr/toolbox/commit/7c8fa140809cfec4a17b13362155f61a77135580)]:
  - tsuru@0.1.0
