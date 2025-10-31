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
      listener: (this: NetworkInformation, ev: Event) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
      type: 'change',
      listener: (this: NetworkInformation, ev: Event) => any,
      options?: boolean | EventListenerOptions
    ): void;
  }
}

// === Constants ===
const TEST_URLS = ['https://www.google.com/favicon.ico'] as const;
const DEFAULT_TIMEOUT = 10_000;
const POLL_INTERVAL = 2000;
const FETCH_TIMEOUT = 5000;

// === Global State ===
let networkStatusCallbacks: NetworkStatusCallback[] = [];
let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;
let connectionHandler: (() => void) | null = null;

/**
 * Checks if the device has real internet connectivity by attempting to fetch a small resource.
 * Uses `no-cors` HEAD requests to avoid CORS issues.
 */
export const isOnline = async (): Promise<boolean> => {
  if (!navigator.onLine) return false;

  const testPromises = TEST_URLS.map(async (url) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

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

/**
 * Waits for network connectivity with a timeout.
 * Resolves `true` when online, rejects with error on timeout.
 */
export const waitForNetwork = async (timeout: number = DEFAULT_TIMEOUT): Promise<true> => {
  const currentlyOnline = await isOnline();
  if (currentlyOnline) {
    return true;
  }

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

/**
 * Subscribe to network status changes.
 * Callback receives `true` for online, `false` for offline.
 */
export const onNetworkStatusChange = (callback: NetworkStatusCallback): void => {
  networkStatusCallbacks.push(callback);

  if (networkStatusCallbacks.length === 1) {
    setupNetworkListeners();
  }
};

/**
 * Remove a previously registered network status callback.
 */
export const removeNetworkStatusListener = (callback: NetworkStatusCallback): void => {
  networkStatusCallbacks = networkStatusCallbacks.filter((cb) => cb !== callback);

  if (networkStatusCallbacks.length === 0) {
    cleanupNetworkListeners();
  }
};

// === Internal: Setup & Cleanup ===

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

  // Enhanced: Listen to Network Information API if available
  if ('connection' in navigator && navigator.connection) {
    const connection = navigator.connection as NetworkInformation;

    connectionHandler = () => {
      console.log('Connection change detected:', connection.effectiveType);
      networkStatusCallbacks.forEach((cb) => cb(navigator.onLine));
    };

    connection.addEventListener('change', connectionHandler);

    // Type-safe attachment using interface
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

  connectionHandler = null;
};