import { createEvolu, SimpleName } from '@evolu/common';
import { evoluReactWebDeps } from '@evolu/react-web';

import { Schema } from './schema';

export const evolu = createEvolu(evoluReactWebDeps)(Schema, {
  name: SimpleName.orThrow('susumu'),
  transports: [
    {
      type: 'WebSocket',
      url: 'wss://sync.susumu.ondrejlangr.cz',
    },
  ],
});
