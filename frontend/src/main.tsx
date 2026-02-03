import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminAuthContextProvider } from './context/AdminAuthContext.tsx'
import { EmployeeAuthProvider } from './context/EmployeeAuthContext.tsx'
import { SuperAdminAuthContextProvider } from './context/SuperAdminAuthContext.tsx'
import { NetworkStatusProvider } from './context/useNetworkContext.tsx'
import { SocketProvider } from './context/SocketContext';
import { API_URL } from './api/api';

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <NetworkStatusProvider>
      <SocketProvider serverUrl={API_URL} >
        <SuperAdminAuthContextProvider>
          <AdminAuthContextProvider>
            <EmployeeAuthProvider>
              <App />
            </EmployeeAuthProvider>
          </AdminAuthContextProvider>
        </SuperAdminAuthContextProvider>
      </SocketProvider>
    </NetworkStatusProvider>

  </StrictMode>,
)
