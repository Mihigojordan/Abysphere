// contexts/NetworkStatusContext.tsx
import React, { createContext, useContext, type ReactNode } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';


// === Types ===
interface NetworkStatus {
  isOnline: boolean;
  isChecking: boolean;
  browserOnline: boolean;
}

interface NetworkStatusProviderProps {
  children: ReactNode;
  retryInterval?: number;
}

const NetworkStatusContext = createContext<NetworkStatus | undefined>(undefined);

// === Provider ===
export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({
  children,
  retryInterval = 1000,
}) => {
  const networkStatus = useNetworkStatus(retryInterval);


  return (
    <NetworkStatusContext.Provider value={networkStatus}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

// === Hook ===
export const useNetworkStatusContext = (): NetworkStatus => {
  const context = useContext(NetworkStatusContext);

  if (!context) {
    throw new Error('useNetworkStatusContext must be used within a NetworkStatusProvider');
  }

  return context;
};

// === Example Usage ===
// App.tsx
/*
import { NetworkStatusProvider } from './contexts/NetworkStatusContext';

function App() {
  return (
    <NetworkStatusProvider retryInterval={3000}>
      <YourAppContent />
    </NetworkStatusProvider>
  );
}
*/

// SomeComponent.tsx
/*
import { useNetworkStatusContext } from './contexts/NetworkStatusContext';

function SomeComponent() {
  const { isOnline, isChecking } = useNetworkStatusContext();

  return (
    <div>
      {!isOnline && <div>You're offline!</div>}
      {isChecking && <div>Checking connection...</div>}
    </div>
  );
}
*/