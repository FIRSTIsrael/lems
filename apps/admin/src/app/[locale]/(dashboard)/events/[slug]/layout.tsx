'use client';

import React, { createContext, useContext } from 'react';
import { redirect, useParams } from 'next/navigation';
import useSWR from 'swr';
import { Box, CircularProgress, Typography } from '@mui/material';
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

  const {
    data: event,
    error,
    isLoading
  } = useSWR<Event>(`/admin/events/slug/${slug}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography>Loading event...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('Failed to load event:', error);
    redirect('/events');
  }

  if (!event) {
    redirect('/events');
  }

  return <EventContext.Provider value={event}>{children}</EventContext.Provider>;
}
