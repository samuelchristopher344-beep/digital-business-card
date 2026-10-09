import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from '@tanstack/react-router'
import { router } from './router'
import { Capacitor } from '@capacitor/core'

// Initialize Capacitor app
if (Capacitor.isNativePlatform()) {
  console.log('Running on native platform:', Capacitor.getPlatform())
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router router={router} />
  </React.StrictMode>,
)
