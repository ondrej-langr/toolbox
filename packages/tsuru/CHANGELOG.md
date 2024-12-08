# @ondrej-langr/bob

## 0.4.1

### Patch Changes

- [`2346bde`](https://github.com/ondrej-langr/toolbox/commit/2346bde0542c1d8230498ddb1147cea699f86fd0) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Updates logging and prints help when user does not run any command

## 0.4.0

### Minor Changes

- [#3](https://github.com/ondrej-langr/toolbox/pull/3) [`2db1e18`](https://github.com/ondrej-langr/toolbox/commit/2db1e18adf2dbfab43438cecf2ff873b1b15183c) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Allows packageJson to pass through the config one object level deep

- [#3](https://github.com/ondrej-langr/toolbox/pull/3) [`2db1e18`](https://github.com/ondrej-langr/toolbox/commit/2db1e18adf2dbfab43438cecf2ff873b1b15183c) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Workspace of a package can no longer be accessed through static property of a Project instance. Instead please use async method `Workspace.loadNearest()` which tries to find the nearest workspace for current provided directory.

## 0.3.0

### Minor Changes

- [#2](https://github.com/ondrej-langr/toolbox/pull/2) [`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Adds capability to define variables for templates

- [#2](https://github.com/ondrej-langr/toolbox/pull/2) [`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Removes addTemplatesLayer and renderTemplateLayers methods from Command. To render template layer use renderTemplates method from TemplateLayer class instead.

- [#2](https://github.com/ondrej-langr/toolbox/pull/2) [`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Define templates layer with new defineTemplatesLayer function and register template layer into command with Command.addTemplatesFile method

### Patch Changes

- [#2](https://github.com/ondrej-langr/toolbox/pull/2) [`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Fixes exported types and definitions

## 0.2.0

### Minor Changes

- [#1](https://github.com/ondrej-langr/toolbox/pull/1) [`fd6668a`](https://github.com/ondrej-langr/toolbox/commit/fd6668a69ffc1385a43c27c35a7aa5dbe8c331ca) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Updates exported API and exports only minimal functions and definitions for creating plugins.

- [#1](https://github.com/ondrej-langr/toolbox/pull/1) [`fd6668a`](https://github.com/ondrej-langr/toolbox/commit/fd6668a69ffc1385a43c27c35a7aa5dbe8c331ca) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Reworks metadata logic. Metadata can now be defined through Project instances with `getMetadataNamespace` method. Through this method user provides namespace name and its schema. Return type has get and set.

- [#1](https://github.com/ondrej-langr/toolbox/pull/1) [`fd6668a`](https://github.com/ondrej-langr/toolbox/commit/fd6668a69ffc1385a43c27c35a7aa5dbe8c331ca) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - BREAKING: Detaches commands from package and implements plugin functionality. Plugins will define commands and are used either in whole workspace, in standalone project or workspace project where the plugins defined in workspace are inherited to currently executed project.

## 0.1.0

### Minor Changes

- [`ae618ab`](https://github.com/ondrej-langr/toolbox/commit/ae618ab73a97162d3eaa7689c76c1738544b9cdc) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Introduces workspace:create, workspace:update, project:create and project:update commands

  - workspace:create - Creates workspace with predefined config files
  - workspace:update - Applies latest downloaded templates and applies updates by current snapshots. It will override files that are defined as required. It may also require certain parts of code to be there in certain files. During update it will makes sure that some required pieces of code are there.
  - project:create - Creates project in provided `cwd` (either cli pwd or value of provided --cwd cli param). If there is an existing workspace in cwd it asks user on specific location of workspace instead of letting them save it by themselves. Location of saved projects is calculated by workspace configurations in current package manager
  - project:update - Same as `workspace:update`, but it scopes work to neares project instead

- [`ae618ab`](https://github.com/ondrej-langr/toolbox/commit/ae618ab73a97162d3eaa7689c76c1738544b9cdc) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Creates package 🎉

### Patch Changes

- [`14749fb`](https://github.com/ondrej-langr/toolbox/commit/14749fb0198ba4fb17289723090fce6f5e28a35a) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Updates packages to latests except inquirer
