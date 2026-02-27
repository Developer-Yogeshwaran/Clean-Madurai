import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        }
      }} />
    </AuthProvider>
  </React.StrictMode>
);
