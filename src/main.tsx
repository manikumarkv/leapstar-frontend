import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AppProviders } from './providers/app/AppProviders';
import { AppRouter } from './routes/AppRouter';
import './styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find root element');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
