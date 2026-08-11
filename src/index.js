import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Automatically add Bypass-Tunnel-Reminder and ngrok-skip headers to all fetches
// so that localtunnel and ngrok bypass pages never break the Vercel app.
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  let [resource, config] = args;
  if (typeof resource === 'string' && (resource.includes('loca.lt') || resource.includes('trycloudflare.com') || resource.includes('ngrok'))) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    // Check if headers is an instance of Headers (some components use new Headers())
    if (config.headers instanceof Headers) {
      config.headers.append('Bypass-Tunnel-Reminder', 'true');
      config.headers.append('ngrok-skip-browser-warning', 'true');
    } else {
      config.headers['Bypass-Tunnel-Reminder'] = 'true';
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    args[1] = config;
  }
  return await originalFetch(...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
