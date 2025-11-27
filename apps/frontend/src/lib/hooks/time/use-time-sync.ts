import { useContext } from 'react';
import { TimeSyncContext } from '../../../app/[locale]/components/time-sync-provider';

/**
 * Hook to access time synchronization offset
 * @returns Object containing the time offset in milliseconds
 */
export const useTimeSync = () => {
  const context = useContext(TimeSyncContext);

  if (!context) {
    throw new Error('useTimeSync must be used within TimeSyncProvider');
  }

  return context;
};
