import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios';

// Set the base URL for all axios requests
// In production, this should be your Render backend URL (e.g., https://my-app-server.onrender.com)
// In development, it falls back to localhost:3000
const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
axios.defaults.baseURL = serverUrl;
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
