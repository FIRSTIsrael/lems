import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import * as timeSyncClient from 'timesync';
import { getApiBase } from './utils/fetch';

type TimeSyncContextType = {
  offset: number;
};

const TimeSyncContext = createContext<TimeSyncContextType>({ offset: 0 });

export const useTimeSync = () => useContext(TimeSyncContext);

export const TimeSyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    const timesync = timeSyncClient.create({
      server: getApiBase(true) + '/timesync',
      interval: 30 * 1000
    });

    timesync.on('change', setOffset);

    return () => timesync.off('change');
  }, []);

  return <TimeSyncContext.Provider value={{ offset }}>{children}</TimeSyncContext.Provider>;
};
