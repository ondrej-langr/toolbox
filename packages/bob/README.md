# @ondrejlangr/bob

@ondrejlangr/bob is a project that allows for simpler CLI applications with focus on code generation.

## Supported engines

- Node.js >= 20
- PNPM >= 8

## Installation

Installation works like in any other package installation

- globally:
  ```bash
  pnpm i -g @ondrejlangr/bob
  ```
- in existing project or workspace:
  ```bash
  pnpm i @ondrejlangr/bob
  ```

## Usage

- any command - `npx @ondrejlangr/bob <command>`

## Commands

Bob already includes working commands with predefined templates.

- `help` - prints help of the program
- `workspace:create` - creates workspace, throws if command is executed in workspace
- `workspace:update` - updates workspace with active settings with latest templates
- `project:create` - creates new project in current workspace or in current working directory
- `project:update` - updates project with active settings with latest templates

### Global arguments

- `--cwd` - specifies in which directory should program work, if not defined then its current working directory as default
- `--debug` - if defined enables debug messages

## Contribution

You can read more about necessary info about this project [here](./docs/contribution.md)
