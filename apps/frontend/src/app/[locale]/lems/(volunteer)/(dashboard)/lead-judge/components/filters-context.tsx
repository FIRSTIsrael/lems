'use client';

import React, { createContext, useContext, useState } from 'react';

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
  const [teamFilter, setTeamFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [roomFilter, setRoomFilter] = useState<string[]>([]);
  const [sessionNumberFilter, setSessionNumberFilter] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'room' | 'session'>('room');

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
