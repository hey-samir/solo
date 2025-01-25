import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

console.log('Starting React application...');

const root = document.getElementById('root')
if (!root) {
  console.error('Root element not found in the DOM');
  throw new Error('Root element not found')
}

console.log('Root element found, mounting React application...');

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
  console.log('React application mounted successfully');
} catch (error) {
  console.error('Failed to mount React application:', error);
}