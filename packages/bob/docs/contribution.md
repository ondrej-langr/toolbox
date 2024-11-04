# Contribition

> [!IMPORTANT]
> This documentation is work in progress and may miss some things

Welcome to the contribution guide to @ondrej-langr/bob!

## What it uses

Here is a list of main third party libraries that make this project work:

- `commander` - library for creating commands and managing their parameters
- `inquirer` - using for cli prompts that commands might have
- `zod` - validating objects and JSON contents
- `cosmiconfig` - manages importing and resolving configurations

## Project structure

This project is build upon some rules that every developer of this project must follow:

- commands
  - Where commands are defined
  - Command name is the same as the folder name in `commands` folder
  - For command to be valid there must be a `command.ts` file in command folder with [`Command`](../src/Command.ts) class instance as the default export
- metadata-types
  - Includes metadata types definition ands schemas
  - Each project and workspace could have its own metadata
  - Metadata are usually configurations and combinations that project has
- schemas
  - All the other schemas
- types
  - Stored type definitions
- utils
  - Global utility functions
- [Command.ts](../src/Command.ts)
  - Class which defines logic tied to commands it self
  - Also includes rendering helpers connected to the [TemplateLayer.ts](../src/TemplateLayer.ts)
- [FileSystem.ts](../src/FileSystem.ts)
  - Custom filesystem that batches any type of work into one method
- [program.ts](../src/program.ts)
  - Where the `commander` program itself is defined
- [Project.ts](../src/Project.ts)
  - Class that loads currently defined Node.js projects into memory
  - Exposes methods to mutate or inspect such projects
- [run.ts](../src/run.ts)
  - Main entry file that is executed first where the `@ondrej-langr/bob` is called
- [TemplateFile.ts](../src/TemplateFile.ts)
  - Defines template rendering for a file
  - Can be used to define templates programaticaly (See [About types of templates](#about-types-of-templates) for more info)
- [TemplateLayer.ts](../src/TemplateLayer.ts)
  - Handles the execution of multiple [TemplateFile.ts](../src/TemplateFile.ts) in one [layer](#template-layers)
- [Workspace.ts](../src/Workspace.ts)
  - Is built on [Project.ts](../src/Project.ts) with functionality geared towards Node.js workspaces

## Commands

This section will teach you how are commands created

### Simple command

Creating a command is pretty simple actually

1. Think of a command name (command name should be kebab-cased and divided with ":" if grouped)
2. Create a folder with the name from step 1 under `src/commands` folder
3. Create a `command.ts` file (this is a entry file for this command)
4. Export a `Command` instance as default from newly created `command.ts`

   ```ts
   // src/commands/my-command/command.ts
   import { Command } from "~/Command.js";

   export default Command.define(
     {
       // Define description that is showed to user
       description: 'This is my file description'
     },
     // Do the magic in handler
     async handler() {
       const { cwd } = getProgramOptions();

       console.log(`Commnad has been run at ${cwd}`)
     }
   );
   ```

5. Make magic happen!

### With arguments

Command class provides a simple set of tools that help you define type safe arguments

1. Create new command as decribed in [Simple Command](#simple-command) section
2. And update the file a little bit

   ```ts
   // src/commands/my-command/command.ts
   const desiredFoodOptions = ['pizza', 'salad'] as const;
   type CommadOptions = { desiredFood: typeof desiredFoodOptions[number] }

   export default Command.define<CommadOptions>(
     {
       // Define description that is showed to user
       description: 'This is my file description',

       // Here you will define
       questions: [
         {
           // name will be type safe!
           name: 'desiredFood',
           type: 'list',
           message: 'Choose desired food',
           choices: desiredFoodOptions,
         },
       ]
     },
     async handler() {
       // get typesafe answers
       const { desiredFood } = this.getAnswers();

       console.log(`You hunger for the ${desiredFood}!`)
     }
   );
   ```

3. Done and dusted!

## Templates

This section will guide through templates implementation in this project

### About types of templates

This section explains types of templates and how to create them.

Templates can be described by two types:

- EJS templates
  - ✅ Simple templates
  - ✅ Simple usage - just create a `<result-file-name-with-extension>.ejs` file
  - ❌ Without type inference
  - ❌ Existing files are always overidden with templates outputs
- Programatically defined templates

  - ❌ Complex templates
  - ❌ Little bit of a boilerplate to get started

    - create a `<result-file-name-with-extension>.templ.ts` file
    - Define template logic with Template class and export as default

      ```ts
      import { TemplateFile } from '~/TemplateFile.js';

      export default TemplateFile.define('json', (existing) => {
        // do magic (validation, fetching, etc...)
        // And now return what should be in the file after the template is done generating
        return {
          ...existing,
          override: 'this',
        };
      });
      ```

  - ✅ Type inference
  - ✅ Template always gets current file contents which lets it merge over existing contents of file
  - ✅ Each file type has its own parser. All parsing from or back to file handles the parser itself. Template just gets and retuns the same datatype
    - **JSON** - parses file contents into POJO
    - **Text** - reads file as is which allows for highest flexibility
    - **YAML** - parses yaml file contents into POJO
    - **Typescript/Javascript** - parses file contents into AST
    - **<insert-language-name>** - @ondrej-langr/bob can practically parse and manage virtually any language as long as it can be reasonably parsed with tools like AST

Its up to user which template serves the purpose the best.

### Template layers

Template layer is a batch of files that define how one specific functionality is structured or defined. This batch of files is then attached under its respective command.

Required mentality around template layers is pretty simple. The whole idea is just to divide the functionality in parts (folders) so they can easily be combined between each other.
To put it simply: "Template Layers" is just fancy work for "folder structure rules"

To start with layers user needs to define one root folder that will serve as the root layer where user will put the files that will render.
To render files user will create a folder in which templates will reside. Path to this folder is then passed to the [TemplateLayer.ts](../src/TemplateLayer.ts) constructor itself.
Adding sublayers (layers that share common file structure, but differ in some files) is as easy as creating a new folder with the name having a `+` sign at the start. This tells the rendering engine ([TemplateLayer.ts](../src/TemplateLayer.ts)) to not go further when rendering the upper template layer.

In case of commands - commands have one simple rule since binding template layer is done through Command interface itself: top layer is `templates` folder created at the root of the command folder.

### Rendering

Template Layer should be used for rendering.
To get started user needs to use the [TemplateLayer.ts](../src/TemplateLayer.ts) class to mark where the template layer resides and then run `renderTemplates(...)` method to actually render the files.

```ts
import { TemplateLayer } from './TemplateLayer.js';
const templateLayer = new TemplateLayer(
  "/my/absolute/path/to/templates",
  options: {
    onBeforeRender() {
      console.log(`Started rendering template layer ${this.dirname}`)
    }
  },
);

templateLayer.renderTemplates("/my/absolute/destionation");
```

Rendering in the command is easier:

```ts
import { Command } from '../../Command.js';
import { getProgramOptions } from '../../program.js';
import { Workspace } from '../../Workspace.js';

export default Command.define({
  description: 'Some Command',
  questions: [],
  async handler() {
    const { cwd } = getProgramOptions();
    const workspace = await Workspace.loadNearest(cwd);

    if (!workspace) {
      throw new Error(
        `No workspace has been found on ${cwd} or anywhere up in the file system`,
      );
    }

    // This just binds it, work is done after the handler is at the end
    this.bindTemplatesLayer(
      // This will create template layer for `templates` folder in the root of the command
      '/',
      {
        renderTo: workspace.getRoot(),
      },
    );
  },
});
```

### About variables

Variables are yet to be supported

### About migrations

Migrations are yet to be implemented
