'use client';

import React, { ReactNode, createContext, useEffect, useState } from 'react';
import * as timeSyncClient from 'timesync';

export interface TimeSyncContextType {
  offset: number;
  isInitialized: boolean;
}

export const TimeSyncContext = createContext<TimeSyncContextType | undefined>(undefined);

interface TimeSyncProviderProps {
  children: ReactNode;
  /** Server URL for time synchronization (defaults to NEXT_PUBLIC_BASE_URL/timesync) */
  serverUrl?: string;
  /** Sync interval in milliseconds (defaults to 30 seconds) */
  syncInterval?: number;
}

/**
 * Provider component for server time synchronization
 * Synchronizes client clock with server time using SNTP-based algorithm
 * 
 * Usage:
 * ```tsx
 * <TimeSyncProvider>
 *   <App />
 * </TimeSyncProvider>
 * ```
 * 
 * Then use `useTimeSync()` hook to access the time offset in child components
 */
export const TimeSyncProvider: React.FC<TimeSyncProviderProps> = ({
  children,
  serverUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/timesync`,
  syncInterval = 30 * 1000, // 30 seconds
}) => {
  const [offset, setOffset] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let timesync: ReturnType<typeof timeSyncClient.create> | null = null;
    let isMounted = true;

    const initializeTimeSync = async () => {
      try {
        timesync = timeSyncClient.create({
          server: serverUrl,
          interval: syncInterval,
          timeout: 10000,
          delay: 1000,
        });

        const handleOffsetChange = (newOffset: number) => {
          if (isMounted) {
            setOffset(newOffset);
          }
        };

        const handleError = (error: unknown) => {
          console.warn('[TimeSyncProvider] Synchronization error:', error);
          // Continue with current offset if sync fails
        };

        const handleSync = (event: 'start' | 'end') => {
          if (event === 'end' && isMounted) {
            setIsInitialized(true);
          }
        };

        timesync.on('change', handleOffsetChange);
        timesync.on('error', handleError);
        timesync.on('sync', handleSync);

        // Trigger initial sync
        timesync.sync();

        return () => {
          timesync?.off('change');
          timesync?.off('error');
          timesync?.off('sync');
        };
      } catch (error) {
        console.error('[TimeSyncProvider] Failed to initialize:', error);
      }
    };

    const cleanup = initializeTimeSync();

    return () => {
      isMounted = false;
      cleanup?.then((fn) => fn?.());
      if (timesync) {
        timesync.destroy();
      }
    };
  }, [serverUrl, syncInterval]);

  return (
    <TimeSyncContext.Provider value={{ offset, isInitialized }}>
      {children}
    </TimeSyncContext.Provider>
  );
};
