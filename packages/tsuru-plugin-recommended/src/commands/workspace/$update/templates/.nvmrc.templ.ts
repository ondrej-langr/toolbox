import { defineTemplateFile } from 'tsuru';

import { DEFAULT_NODE_VERSION } from '../../../../constants.js';

export default defineTemplateFile('text', () =>
  String(DEFAULT_NODE_VERSION),
);
