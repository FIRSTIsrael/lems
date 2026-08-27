'use client';

import { createContext, useContext } from 'react';
import { useSearchParams } from 'next/navigation';

interface EventContextType {
  eventId: string;
  eventName: string;
  eventLocation: string;
  currentDivision: { id: string; name: string; color: string };
  availableDivisions: { id: string; name: string; color: string }[];
  canSwitchDivisions: boolean;
}

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({
  children,
  eventId,
  eventName,
  eventLocation,
  divisions
}: {
  children: React.ReactNode;
  eventId: string;
  eventName: string;
  eventLocation: string;
  divisions: { id: string; name: string; color: string }[];
}) {
  const searchParams = useSearchParams();
  const divisionId = searchParams.get('division');

  let currentDivision: { id: string; name: string; color: string };

  if (divisionId) {
    const selectedDivision = divisions.find(d => d.id === divisionId);
    if (selectedDivision) {
      currentDivision = selectedDivision;
    } else {
      throw new Error(`Division ${divisionId} not found`);
    }
  } else {
    // No division parameter, default to first
    currentDivision = divisions[0];
  }

  const eventContext = {
    eventId,
    eventName,
    eventLocation,
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
