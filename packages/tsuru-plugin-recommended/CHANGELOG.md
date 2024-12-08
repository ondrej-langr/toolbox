# tsuru-plugin-recommended

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
