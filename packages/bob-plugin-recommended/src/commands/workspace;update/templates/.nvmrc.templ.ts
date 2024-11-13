import { defineTemplateFile } from '@ondrej-langr/bob';

import { DEFAULT_NODE_VERSION } from '../../../constants.js';

export default defineTemplateFile('text', () =>
  String(DEFAULT_NODE_VERSION),
);
