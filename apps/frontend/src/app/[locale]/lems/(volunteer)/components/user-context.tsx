'use client';

import React, { createContext, useContext } from 'react';
import { LemsUser } from '@lems/types/api/lems';

const UserContext = createContext<LemsUser | null>(null);

export function UserProvider({ value, children }: { value: LemsUser; children: React.ReactNode }) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): LemsUser {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
