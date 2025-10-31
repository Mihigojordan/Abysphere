// hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';

// === Type Declarations (Embedded) ===
type NetworkStatusCallback = (isOnline: boolean) => void;

interface EnhancedHandler extends Function {
  connectionHandler?: () => void;
}

declare global {
  interface Navigator {
    readonly connection?: NetworkInformation;
  }

  interface NetworkInformation extends EventTarget {
    readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    readonly downlink?: number;
    readonly rtt?: number;
    readonly saveData?: boolean;
    onchange?: ((this: NetworkInformation, ev: Event) => any) | null;
    addEventListener(
      type: 'change',
      listener: (this: NetworkInformation, ev: Event) => any
    ): void;
    removeEventListener(
      type: 'change',
      listener: (this: NetworkInformation, ev: Event) => any
    ): void;
  }
}

// === Constants ===
const TEST_URLS = [
  'https://www.google.com/favicon.ico',
  'https://www.cloudflare.com/favicon.ico',
  'https://www.wikipedia.org/favicon.ico',
] as const;
const DEFAULT_RETRY_INTERVAL = 5000;
const POLL_INTERVAL = 2000;
const DEFAULT_TIMEOUT = 10000;

// === Global State ===
let networkStatusCallbacks: NetworkStatusCallback[] = [];
let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;

// === Core: isOnline ===
export const isOnline = async (retryInterval: number = DEFAULT_RETRY_INTERVAL): Promise<boolean> => {
  if (!navigator.onLine) return false;

  const testPromises = TEST_URLS.map(async (url) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), retryInterval);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.type === 'opaque';
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  });

  try {
    const results = await Promise.allSettled(testPromises);
    return results.some(
      (result) =>
        result.status === 'fulfilled' && (result as PromiseFulfilledResult<boolean>).value
    );
  } catch {
    return false;
  }
};

// === waitForNetwork ===
export const waitForNetwork = async (timeout: number = DEFAULT_TIMEOUT): Promise<true> => {
  const currentlyOnline = await isOnline();
  if (currentlyOnline) return true;

  return new Promise<true>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Connection timeout'));
    }, timeout);

    let checkInterval: NodeJS.Timeout | null = null;

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (checkInterval) clearInterval(checkInterval);
      window.removeEventListener('online', onlineHandlerWrapper);
    };

    const onlineHandlerWrapper = async () => {
      const reallyOnline = await isOnline();
      if (reallyOnline) {
        cleanup();
        resolve(true);
      }
    };

    window.addEventListener('online', onlineHandlerWrapper);

    checkInterval = setInterval(async () => {
      const online = await isOnline();
      if (online) {
        cleanup();
        resolve(true);
      }
    }, POLL_INTERVAL);
  });
};

// === Event Listener Utils ===
export const onNetworkStatusChange = (callback: NetworkStatusCallback): void => {
  networkStatusCallbacks.push(callback);
  if (networkStatusCallbacks.length === 1) {
    setupNetworkListeners();
  }
};

export const removeNetworkStatusListener = (callback: NetworkStatusCallback): void => {
  networkStatusCallbacks = networkStatusCallbacks.filter((cb) => cb !== callback);
  if (networkStatusCallbacks.length === 0) {
    cleanupNetworkListeners();
  }
};

const setupNetworkListeners = (): void => {
  onlineHandler = () => {
    console.log('Browser online event fired');
    networkStatusCallbacks.forEach((cb) => cb(true));
  };

  offlineHandler = () => {
    console.log('Browser offline event fired');
    networkStatusCallbacks.forEach((cb) => cb(false));
  };

  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);

  if ('connection' in navigator && navigator.connection) {
    const connection = navigator.connection as NetworkInformation;
    const connectionHandler = () => {
      console.log('Connection change detected:', connection.effectiveType);
      networkStatusCallbacks.forEach((cb) => cb(navigator.onLine));
    };

    connection.addEventListener('change', connectionHandler);
    (onlineHandler as EnhancedHandler).connectionHandler = connectionHandler;
  }
};

const cleanupNetworkListeners = (): void => {
  if (onlineHandler) {
    window.removeEventListener('online', onlineHandler);
    const enhanced = onlineHandler as EnhancedHandler;
    if (enhanced.connectionHandler && 'connection' in navigator) {
      (navigator.connection as NetworkInformation).removeEventListener(
        'change',
        enhanced.connectionHandler
      );
    }
    onlineHandler = null;
  }

  if (offlineHandler) {
    window.removeEventListener('offline', offlineHandler);
    offlineHandler = null;
  }
};

// === Hook: useNetworkStatus ===
export const useNetworkStatus = (retryInterval: number = DEFAULT_RETRY_INTERVAL) => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    let retryTimer: NodeJS.Timeout | null = null;

    const checkInternetConnectivity = async (): Promise<boolean> => {
      if (!mounted) return false;

      setIsChecking(true);
      try {
        const status = await isOnline(retryInterval);
        if (mounted) {
          setOnline(status);
          setIsChecking(false);
        }
        return status;
      } catch (error) {
        console.error('Error checking internet connectivity:', error);
        if (mounted) {
          setOnline(false);
          setIsChecking(false);
        }
        return false;
      }
    };

    // Initial check
    checkInternetConnectivity();

    const handleNetworkChange = async (browserOnlineStatus: boolean) => {
      if (!mounted) return;

      console.log('Network change detected:', browserOnlineStatus ? 'online' : 'offline');

      if (!browserOnlineStatus) {
        setOnline(false);
        setIsChecking(false);
        if (retryTimer) {
          clearInterval(retryTimer);
          retryTimer = null;
        }
      } else {
        console.log('Browser online - verifying internet connectivity...');
        if (retryTimer) {
          clearInterval(retryTimer);
          retryTimer = null;
        }

        const startConnectivityCheck = async () => {
          const hasInternet = await checkInternetConnectivity();

          if (!hasInternet && mounted) {
            retryTimer = setInterval(async () => {
              if (!mounted) {
                if (retryTimer) {
                  clearInterval(retryTimer);
                  retryTimer = null;
                }
                return;
              }

              const connected = await checkInternetConnectivity();
              if (connected && mounted) {
                console.log('Real internet connectivity restored!');
                clearInterval(retryTimer!);
                retryTimer = null;
              }
            }, retryInterval);
          }
        };

        startConnectivityCheck();
      }
    };

    // Subscribe
    onNetworkStatusChange(handleNetworkChange);

    // Periodic fallback
    const periodicTimer = setInterval(async () => {
      if (!mounted) return;
      if (navigator.onLine && !online && !isChecking) {
        console.log('Periodic check - browser online but state offline, verifying...');
        await checkInternetConnectivity();
      }
    }, retryInterval * 2);

    return () => {
      mounted = false;
      if (retryTimer) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
      clearInterval(periodicTimer);
      removeNetworkStatusListener(handleNetworkChange);
    };
  }, [retryInterval]);

  return {
    isOnline: online,
    isChecking,
    browserOnline: navigator.onLine,
  };
};