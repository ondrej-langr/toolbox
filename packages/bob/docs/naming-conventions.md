# Naming Conventions

Bob has some naming that its better to follow

- Plugin naming
    - Please make sure that `bob-plugin` is mentioned somewhere in the package name
    - Examples
      - `@acme/bob-plugin`
      - `acme-bob-plugin`
      - `my-bob-plugin`
- Commands naming
    - Some systems do not like it when you have special characters in the folder name. Something like ":" is not allowed
    - Example of correct commands and its folders
        - folder `test` -> command `test`
        - folder `workspace-update` -> command `workspace-update`
        - folder `workspace/$update` -> command `workspace update`
- Templates locations
    - Templates can be placed practically anywhere, but please think about the placement. Templates only for commands should remain placed in its commands
    - Examples where to put templates:
      - Templates for a command that manages project -> `commands/my-command/templates/`
      - Templates that are shared between commands -> `templates/`
    - Please also note that templates are registered in layers. Read about it more in [commands structure](./structuring-your-commands.md)
