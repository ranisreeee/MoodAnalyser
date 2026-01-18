import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim for process.env to ensure compatibility with library code that expects it
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: {} };
}

// Register Service Worker for background capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Using relative path to ensure it resolves correctly in the dist folder
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