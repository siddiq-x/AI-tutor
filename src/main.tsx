import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Starting React app...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React root...');
  
  try {
    const root = createRoot(rootElement);
    console.log('✅ React root created, rendering app...');
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log('✅ React app rendered successfully!');
  } catch (error) {
    console.error('❌ Failed to mount React app:', error);
  }
}