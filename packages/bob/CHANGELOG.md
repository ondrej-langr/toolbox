# @ondrej-langr/bob

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
