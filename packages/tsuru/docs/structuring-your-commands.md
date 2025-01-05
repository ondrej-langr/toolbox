# Structuring your commands

Here you can find how to structure and name your commands. Structuring your commands is simple as it follows few strict rules.

## About where commands are stored

Commands can be placed in two places: projects or plugins!

### Defining in projects

1. Open your project folder and locate your `package.json` and open command line there
2. Create a `.tsuru` folder on the same level and open that folder
3. Create the `commands` folder in current folder
4. And there create a commands like usually 🎉

### Defining in plugin packages

1. Open your plugin project folder and locate your `index` file that exports everything from plugin package
2. Create a `commands` folder on the same level
3. And there create a commands like usually 🎉

## Naming commands

Naming commands is done through your file system: by creating folders!

### Examples

- `commands` folder
  - `my-command` folder
    - `command.ts` file -> `my-command` command is defined
  - `my-root-command` folder
    - `$build-command` folder
      - `command.ts` file -> `my-root-command:build-command` command is defined
