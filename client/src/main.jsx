import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Set initial dir from stored language
const lang = localStorage.getItem('lang') || 'ar';
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = lang;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
