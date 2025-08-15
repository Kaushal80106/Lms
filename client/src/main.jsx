import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Handle missing publishable key more gracefully
if (!PUBLISHABLE_KEY) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable. Authentication features may not work properly.')
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter> 
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/' >
        <AppContextProvider >
          <App />
        </AppContextProvider>
      </ClerkProvider>
    ) : (
      <AppContextProvider >
        <App />
      </AppContextProvider>
    )}
  </BrowserRouter>,
)
