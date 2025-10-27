'use client';

import { createContext, useContext } from 'react';

interface EventContextType {
  eventId: string;
  eventName: string;
  currentDivision: { id: string; name: string };
  availableDivisions: { id: string; name: string }[];
  canSwitchDivisions: boolean;
}

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({
  value,
  children
}: {
  value: EventContextType;
  children: React.ReactNode;
}) {
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent(): EventContextType {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return ctx;
}
