# @ondrej-langr/bob

## 0.2.2

### Patch Changes

- Updated dependencies [[`2db1e18`](https://github.com/ondrej-langr/toolbox/commit/2db1e18adf2dbfab43438cecf2ff873b1b15183c), [`2db1e18`](https://github.com/ondrej-langr/toolbox/commit/2db1e18adf2dbfab43438cecf2ff873b1b15183c)]:
  - @ondrej-langr/bob@0.4.0

## 0.2.1

### Patch Changes

- [#2](https://github.com/ondrej-langr/toolbox/pull/2) [`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Uses new updated templates layer logic

- Updated dependencies [[`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38), [`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38), [`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38), [`71ad500`](https://github.com/ondrej-langr/toolbox/commit/71ad500afb02431e318d7cfd3e1027c58dabee38)]:
  - @ondrej-langr/bob@0.3.0

## 0.2.0

### Minor Changes

- [#1](https://github.com/ondrej-langr/toolbox/pull/1) [`fd6668a`](https://github.com/ondrej-langr/toolbox/commit/fd6668a69ffc1385a43c27c35a7aa5dbe8c331ca) Thanks [@ondrej-langr](https://github.com/ondrej-langr)! - Fixes commands and updates its templates. Updated templates are mainly for prettier and package.jsons.

### Patch Changes

- Updated dependencies [[`fd6668a`](https://github.com/ondrej-langr/toolbox/commit/fd6668a69ffc1385a43c27c35a7aa5dbe8c331ca), [`fd6668a`](https://github.com/ondrej-langr/toolbox/commit/fd6668a69ffc1385a43c27c35a7aa5dbe8c331ca), [`fd6668a`](https://github.com/ondrej-langr/toolbox/commit/fd6668a69ffc1385a43c27c35a7aa5dbe8c331ca)]:
  - @ondrej-langr/bob@0.2.0

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
