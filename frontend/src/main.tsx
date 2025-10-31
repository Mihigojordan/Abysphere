import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminAuthContextProvider } from './context/AdminAuthContext.tsx'
import { EmployeeAuthProvider } from './context/EmployeeAuthContext.tsx'
import { SuperAdminAuthContextProvider } from './context/SuperAdminAuthContext.tsx'
import { NetworkStatusProvider } from './context/useNetworkContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NetworkStatusProvider>

    <SuperAdminAuthContextProvider>
    <AdminAuthContextProvider>
      <EmployeeAuthProvider>
    <App />
      </EmployeeAuthProvider>
    </AdminAuthContextProvider>
    </SuperAdminAuthContextProvider>
    </NetworkStatusProvider>
  </StrictMode>,
)
