'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FiltersContextType {
  teamFilter: string;
  setTeamFilter: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
  roomFilter: string[];
  setRoomFilter: (value: string[]) => void;
  sessionNumberFilter: number[];
  setSessionNumberFilter: (value: number[]) => void;
  sortBy: 'room' | 'session';
  setSortBy: (value: 'room' | 'session') => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

interface FiltersProviderProps {
  children: React.ReactNode;
}

export const FiltersProvider: React.FC<FiltersProviderProps> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL params
  const teamFilter = searchParams.get('team') || '';
  const statusFilter = searchParams.get('status')
    ? searchParams.get('status')!.split(',').filter(Boolean)
    : [];
  const roomFilter = searchParams.get('room')
    ? searchParams.get('room')!.split(',').filter(Boolean)
    : [];
  const sessionNumberFilter = searchParams.get('session')
    ? searchParams
        .get('session')!
        .split(',')
        .filter(Boolean)
        .map(s => parseInt(s, 10))
    : [];
  const sortBy = (searchParams.get('sortBy') || 'room') as 'room' | 'session';

  const updateUrl = useCallback(
    (updates: Partial<FiltersContextType>) => {
      const newParams = new URLSearchParams(searchParams);

      if ('teamFilter' in updates) {
        if (updates.teamFilter) {
          newParams.set('team', updates.teamFilter);
        } else {
          newParams.delete('team');
        }
      }

      if ('statusFilter' in updates && updates.statusFilter) {
        if (updates.statusFilter.length > 0) {
          newParams.set('status', updates.statusFilter.join(','));
        } else {
          newParams.delete('status');
        }
      }

      if ('roomFilter' in updates && updates.roomFilter) {
        if (updates.roomFilter.length > 0) {
          newParams.set('room', updates.roomFilter.join(','));
        } else {
          newParams.delete('room');
        }
      }

      if ('sessionNumberFilter' in updates && updates.sessionNumberFilter) {
        if (updates.sessionNumberFilter.length > 0) {
          newParams.set('session', updates.sessionNumberFilter.join(','));
        } else {
          newParams.delete('session');
        }
      }

      if ('sortBy' in updates && updates.sortBy) {
        newParams.set('sortBy', updates.sortBy);
      }

      const queryString = newParams.toString();
      router.push(queryString ? `?${queryString}` : '?');
    },
    [router, searchParams]
  );

  const setTeamFilter = useCallback(
    (value: string) => {
      updateUrl({ teamFilter: value });
    },
    [updateUrl]
  );

  const setStatusFilter = useCallback(
    (value: string[]) => {
      updateUrl({ statusFilter: value });
    },
    [updateUrl]
  );

  const setRoomFilter = useCallback(
    (value: string[]) => {
      updateUrl({ roomFilter: value });
    },
    [updateUrl]
  );

  const setSessionNumberFilter = useCallback(
    (value: number[]) => {
      updateUrl({ sessionNumberFilter: value });
    },
    [updateUrl]
  );

  const setSortBy = useCallback(
    (value: 'room' | 'session') => {
      updateUrl({ sortBy: value });
    },
    [updateUrl]
  );

  const value: FiltersContextType = {
    teamFilter,
    setTeamFilter,
    statusFilter,
    setStatusFilter,
    roomFilter,
    setRoomFilter,
    sessionNumberFilter,
    setSessionNumberFilter,
    sortBy,
    setSortBy
  };

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
