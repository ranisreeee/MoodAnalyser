// Shim for process.env must be at the very top before other imports
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: {} };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register Service Worker for background capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Relative path for the built service worker
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered:', registration);
    }).catch(error => {
      console.log('SW registration failed:', error);
    });
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