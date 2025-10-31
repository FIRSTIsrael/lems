'use client';

import { createContext, useContext } from 'react';
import { useSearchParams } from 'next/navigation';

interface EventContextType {
  eventId: string;
  eventName: string;
  currentDivision: { id: string; name: string };
  availableDivisions: { id: string; name: string }[];
  canSwitchDivisions: boolean;
}

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({
  children,
  eventId,
  eventName,
  divisions
}: {
  children: React.ReactNode;
  eventId: string;
  eventName: string;
  divisions: { id: string; name: string }[];
}) {
  const searchParams = useSearchParams();
  const divisionParam = searchParams.get('division');

  let currentDivision: { id: string; name: string };

  if (divisionParam) {
    const selectedDivision = divisions.find(d => d.id === divisionParam);
    if (selectedDivision) {
      currentDivision = selectedDivision;
    } else {
      // Division not found, default to first
      currentDivision = divisions[0];
    }
  } else {
    // No division parameter, default to first
    currentDivision = divisions[0];
  }

  const eventContext = {
    eventId,
    eventName,
    currentDivision,
    availableDivisions: divisions,
    canSwitchDivisions: divisions.length > 1
  };

  return <EventContext.Provider value={eventContext}>{children}</EventContext.Provider>;
}

export function useEvent(): EventContextType {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return ctx;
}
