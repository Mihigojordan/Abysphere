import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminAuthContextProvider } from './context/AdminAuthContext.tsx'
import { EmployeeAuthProvider } from './context/EmployeeAuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthContextProvider>
      <EmployeeAuthProvider>
    <App />
      </EmployeeAuthProvider>
    </AdminAuthContextProvider>
  </StrictMode>,
)
