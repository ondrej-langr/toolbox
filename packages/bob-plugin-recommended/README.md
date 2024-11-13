# @ondrej-langr/bob-plugin-recommended

Starting plugin for any bob project or workspace. Includes every template and command that user or business can benefit from greatly.

## Supported engines

- Node.js >= 20
- PNPM >= 8

## Installation

Installation works like in any other package installation

- globally:
  ```bash
  pnpm i -g @ondrej-langr/bob-plugin-recommended
  ```
- in existing project or workspace:
  ```bash
  pnpm i @ondrej-langr/bob-plugin-recommended
  ```

## Usage

This is a @ondrej-langr/bob plugin. Please follow plugin documentation here [../bob/docs/plugins.md]

### Commands

- `workspace:create` - creates workspace, throws if command is executed in workspace
- `workspace:update` - updates workspace with active settings with latest templates
- `project:create` - creates new project in current workspace or in current working directory
- `project:update` - updates project with active settings with latest templates

## Contribution

You can read more about necessary info about this project [here](./docs/contribution.md)
