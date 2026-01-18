import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global shim for process.env
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: {} };
}

// Register Service Worker for background capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Only attempt registration if we are on the same origin to avoid 'ai.studio' mismatch errors
    const swUrl = new URL('./sw.js', import.meta.url);
    if (swUrl.origin === window.location.origin) {
      navigator.serviceWorker.register('./sw.js').then(registration => {
        console.log('SW registered:', registration);
      }).catch(error => {
        console.warn('SW registration skipped or failed:', error.message);
      });
    } else {
      console.warn('SW registration skipped: Origin mismatch in preview environment.');
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);