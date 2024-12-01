# @ondrej-langr/bob

@ondrej-langr/bob is a project that allows for simpler CLI applications with focus on code generation and managing the code through its lifetime.

## Introduction

Bob is a CLI program that allows for improved management of existing or new projects. p'Practically anything - especially its configuration and structure.
The benefit really comes into play when Bob is used to manage multiple projects that might share common configurations.

The benefits this tool can bring mainly depends on how you, as a developer, approach it. The project management is done with commands and templates defined by you so it is totally up to you how you manage your projects. Bob only brings in the tools.

## Installation

### Prerequisities

- Supported engines
    - Node.js >= 20
    - PNPM >= 8

### Installing @ondrej-langr/bob

- globally if you do not have any project yet:

  ```bash
  pnpm i -g @ondrej-langr/bob
  ```

- in existing project or workspace:
  ```bash
  pnpm i @ondrej-langr/bob
  ```

## Usage

Using @ondrej-langr/bob through CLI is simple and relies on futher development of commands, because bob does not do anything by itself.

You, as a developer, have these options where your commands can be stored:

- in [workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) `.bob/commands` folder
- in simple project `.bob/commands` folder
- or in plugins `commands` folder. More on that later.

### Creating your first command in an existing project

Creating your first command in an existing project is the most simple approach on how you can get to know @ondrej-langr/bob.

1. Install @ondrej-langr/bob in the project root with your favourite package manager
2. Create `.bob` folder in the project root
3. In newly created folder create `commands`. This folder will hold the actual commands.
4. In `commands` folder create a new folder called `my-command`. This name is up to you and this name will be used in the actual program when Bob is executed.
5. Create a `command.js` file in `my-command` folder. This will make the command active and valid, but it still needs basic definition
6. Open `command.js` and define your first command:

   ```js
   // This package holds many helpful tools to help you manage your projects
   import { defineCommand } from '@ondrej-langr/bob';

   // The defineCommand tells bob where it was called and registers it under that folder name. In this case its `my-command`
   export default defineCommand({
     // Give it some description
     description: 'This is my first command',
     // And define your logic for this command (be it sync or async)
     handler() {
       // "this" references to an actual Command instance which holds necessary information about the command, running program, project for which this command was executed (if any) and much more
       this.logger.success('hello world!');
     },
   });
   ```

7. Now test that you created your first command and Bob can see it. Run this command in the root of your current application for which you created the command.
   ```bash
   npx bob --help
   ```
8. Verify that the command is there
9. Now you can test your newly created command!
   ```bash
   npx bob my-command
   ```
10. Profit 🎉

### Creating your first Bob plugin and using it

Managing plugins is essential to using bob, because it allows sharing your commands and templates between projects.
The more projects you use bob on the more you benefit from it, because it allows you to quickly manage your projects and centralize resposiblity.

- Prepare a Node.js project
    - Create a folder for your project
    - Run `npm --init` and answer the questions. Before choosing a name please see our [naming conventions](./docs/naming-conventions.md) and follow them to keep our ecosystem clean.
- Install bob in this new project
    ```bash
    npm i @ondrej-langr/bob
    ```
- Create a folder `dist` and place `index.js` in your newly created project
- In newly created file define your plugin entrypoint
    ```js
    import { definePlugin } from '@ondrej-langr/bob';

    // At this point bob will mark this plugin package as valid
    export default definePlugin({});
    ```
- Create the first command for your plugin (💡 Routing of bob commands is controller with file system)
    - create a folder `commands` in the same folder as you created a `index.js` file
    - in newly created folder create a folder with the name of your command. For example `my-command`
    - and lastly create a `command.js` file in your command folder and add it content:
        ```js
        import { defineCommand } from '@ondrej-langr/bob';

        // The defineCommand tells bob where it was called and registers it under that folder name. In this case its `my-command`
        export default defineCommand({
          // Give it some description
          description: 'This is my first command',
          // And define your logic for this command (be it sync or async)
          handler() {
            // "this" references to an actual Command instance which holds necessary information about the command, running program, project for which this command was executed (if any) and much more
            this.logger.success('hello world!');
          },
        });
        ```
- Now add "exports" field to package.json pointing to our plugin entrypoint `./dist/index.js` (💡 usually user would define "main" field, but we are creating an ESM package instead)
  ```json
  // ...other package.json fields
  // Ensure that it is a esm package with type set to modul
  "type": "module",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      // This is essential so importing this package will point Node.js to our plugin entry file
      "import": "./dist/index.js",
    },
  },
  // This ensures that our dist files are included in our published package when we publish to Node.js package registry (usually npmjs.com)
  "files": ["dist"],
  // ...other package.json fields
  ```
- Now release this package onto `npmjs.com` or any other Node.js package registry
- Install this newly released package in the project you want to use that plugin
    ```bash
    npm i <here-put-your-package-name> --save-dev
    ```
- Now install bob also, but as a dev dependency
    ```bash
    npm i @ondrej-langr/bob --save-dev
    ```
- Create a `.bob` folder with `config.js` file in current project
- Define your config in `config.js` and add there the name of your plugin
    ```js
    import { defineConfig } from '@ondrej-langr/bob';

    export default defineConfig({
      // Adding package name to plugins is essential othervise bob wont use that plugin
      plugins: ['<here-put-your-package-name>'],
    });
    ```
- Profit 😁✌️

### Default Global Arguments

These default arguments are always present and you can use them to your advantage.

- `--cwd` - specifies in which directory should program work, if not defined then its current working directory as default. Is used to verify if command was executed in project.
- `--debug` - if defined enables debug messages

### Whats next?

- If you want to know what type of templates bob supports you can visit [`the documentation for it`](./docs/template-file-types.md)
- To help you fully understand bob please continue with further reading about its public API in the Code Wiki [here]()
- If you just want an example on how to leverage Bob you can visit the [`@ondrej-langr/bob-plugin-recommended`](../bob-plugin-recommended/README.md)
- And if you are ready to contribute you can read about [`contributing`](./docs/contribution/README.md)

## Contribution

You can read more about necessary info about this project [here](./docs/contribution.md)
