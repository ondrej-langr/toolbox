import { cosmiconfig } from 'cosmiconfig';

import { ALLOWED_COMMAND_FILE_EXTENSIONS } from './constants.js';

export const commandsLoader = cosmiconfig('command', {
  searchPlaces: ALLOWED_COMMAND_FILE_EXTENSIONS.map(
    (extension) => `command.${extension}`,
  ),
});
