/** Purpose: Set up global styles/theme and mount the React application. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getInitialTheme } from './theme/themeStorage.js'

// Apply the saved/system theme before React mounts to prevent a theme flash.
document.documentElement.dataset.theme = getInitialTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
