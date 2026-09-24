import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoot } from './app/app-root';
import { registerServiceWorker } from './pwa/register-service-worker';
import './styles.css';

const clerkPublishableKey: unknown = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (typeof clerkPublishableKey !== 'string' || clerkPublishableKey === '') {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set for this build');
}
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('index.html has no #root element');
}

registerServiceWorker();
createRoot(rootElement).render(
  <StrictMode>
    <AppRoot clerkPublishableKey={clerkPublishableKey} />
  </StrictMode>,
);
