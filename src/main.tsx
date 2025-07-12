import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeSecurity } from './utils/csp';
import { initializeBrowserNotifications } from './utils/browserNotifications';

// Initialize security measures
initializeSecurity();

// Initialize browser notifications
initializeBrowserNotifications();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);