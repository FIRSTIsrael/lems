import { createContext } from 'react';

export type TimeSyncContextType = {
  offset: number;
};

export const TimeSyncContext = createContext<TimeSyncContextType>({ offset: 0 });
