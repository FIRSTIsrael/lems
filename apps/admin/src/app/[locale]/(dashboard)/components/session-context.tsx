'use client';

import React, { createContext, useContext } from 'react';
import { PermissionType } from '@lems/database';
import { User } from '@lems/types/api/admin';

export interface SessionValue {
  permissions: PermissionType[];
  user: User;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({
  value,
  children
}: {
  value: SessionValue;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
