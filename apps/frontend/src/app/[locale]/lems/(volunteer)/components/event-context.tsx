'use client';

import { createContext, useContext } from 'react';
import { useSearchParams } from 'next/navigation';

type VolunteerDivision = { id: string; name: string; color: string; futureEdition: boolean };

interface EventContextType {
  eventId: string;
  eventName: string;
  currentDivision: VolunteerDivision;
  availableDivisions: VolunteerDivision[];
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
  divisions: VolunteerDivision[];
}) {
  const searchParams = useSearchParams();
  const divisionId = searchParams.get('division');

  let currentDivision: VolunteerDivision;

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
