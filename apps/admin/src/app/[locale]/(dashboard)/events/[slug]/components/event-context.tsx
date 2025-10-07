'use client';

import React, { createContext, useContext } from 'react';
import { Event } from '@lems/types/api/admin';

const EventContext = createContext<Event | null>(null);

export function EventProvider({ value, children }: { value: Event; children: React.ReactNode }) {
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export const useEvent = (): Event => {
  const event = useContext(EventContext);
  if (!event) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return event;
};
