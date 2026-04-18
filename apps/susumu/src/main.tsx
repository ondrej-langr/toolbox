import { EvoluProvider } from '@evolu/react';
import { Theme } from '@radix-ui/themes';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { evolu } from './evolu.ts';
import './global.css';

dayjs.extend(relativeTime);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EvoluProvider value={evolu}>
      <Theme appearance="dark">
        <App />
      </Theme>
    </EvoluProvider>
  </StrictMode>,
);
