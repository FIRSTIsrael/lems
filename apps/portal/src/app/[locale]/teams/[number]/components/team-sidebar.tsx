'use client';

import React from 'react';
import { Box, Paper, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Event } from '@lems/types/api/portal';
import { useSearchParams } from 'next/navigation';
import { useTeam } from './team-context';
import { SeasonSelector } from './season-selector';

export const TeamSidebar: React.FC = () => {
  const searchParams = useSearchParams();
  const team = useTeam();
  const season = searchParams.get('season') ?? 'latest';

  const { data: events } = useSWR<Event[]>(
    () => `/portal/teams/${team.id}/seasons/${season}/events`,
    {
      suspense: true,
      fallbackData: []
    }
  );
  const t = useTranslations('pages.team');

  if (!events) {
    return null;
  }

  const scrollIntoView = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
      <Paper sx={{ p: 0, mb: 2 }}>
        {/* Season Selector */}
        <Box sx={{ p: 2 }}>
          <SeasonSelector season={season} />
        </Box>

        <Divider />

        {/* Navigation Menu */}
        <List sx={{ p: 0 }}>
          <ListItemButton onClick={() => scrollIntoView('team-info')}>
            <ListItemText primary={t('navigation.team-info')} />
          </ListItemButton>
          <ListItemButton onClick={() => scrollIntoView('event-results')}>
            <ListItemText primary={t('navigation.event-results')} />
          </ListItemButton>
          {/* Dynamic event list based on team's events */}
          {events.length > 0 &&
            events.map((event, index) => (
              <ListItemButton key={index} sx={{ pl: 4 }} onClick={() => scrollIntoView(event.id)}>
                <ListItemText primary={event.name} sx={{ fontSize: '0.875rem' }} />
              </ListItemButton>
            ))}
        </List>
      </Paper>
    </Box>
  );
};
