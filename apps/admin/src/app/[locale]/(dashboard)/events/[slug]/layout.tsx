'use client';

import React, { createContext, useContext } from 'react';
import { redirect, useParams } from 'next/navigation';
import useSWR from 'swr';
import { Event } from '@lems/types/api/admin';

interface EventLayoutProps {
  children: React.ReactNode;
}

const EventContext = createContext<Event | null>(null);

export const useEvent = (): Event => {
  const event = useContext(EventContext);
  if (!event) {
    throw new Error('useEvent must be used within an EventLayout');
  }
  return event;
};

export default function EventLayout({ children }: EventLayoutProps) {
  const params = useParams();
  const slug = params.slug as string;

  const { data: userEvents, error: userEventsError } = useSWR<Event[]>(`/admin/events/me`, {
    revalidateOnReconnect: true,
    suspense: true
  });

  const { data: event, error } = useSWR<Event>(`/admin/events/slug/${slug}`, {
    revalidateOnReconnect: true,
    suspense: true
  });

  if (error || userEventsError) {
    console.error('Failed to load event:', error || userEventsError);
    redirect('/events');
  }

  if (!event) {
    redirect('/events');
  }

  if (userEvents && !userEvents.some(userEvent => userEvent.slug === slug)) {
    redirect('/events');
  }

  return <EventContext.Provider value={event}>{children}</EventContext.Provider>;
}
