'use client';

import React, { useEffect, useState } from 'react';
import { Box, Paper, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Event } from '@lems/types/api/portal';
import { useSearchParams } from 'next/navigation';
import { Link, scrollSpy } from 'react-scroll';
import { SeasonSelector } from './season-selector';
import { useTeam } from './team-context';

export const TeamContents: React.FC = () => {
  const t = useTranslations('pages.team.navigation');
  const team = useTeam();

  const searchParams = useSearchParams();
  const season = searchParams.get('season') ?? team.lastCompetedSeason?.slug ?? 'latest';

  const [activeSection, setActiveSection] = useState('team-info');

  useEffect(() => {
    scrollSpy.update();
  }, []);

  const { data: events = [] } = useSWR<Event[]>(
    () => `/portal/teams/${team.slug}/events?season=${season}`,
    { suspense: true, fallbackData: [] }
  );

  return (
    <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
      <Paper sx={{ p: 0, mb: 2, position: { md: 'sticky' }, top: { md: 20 } }}>
        <SeasonSelector currentSeason={season} />

        <Divider />

        <List sx={{ p: 0 }}>
          <Link
            to="team-info"
            smooth
            spy
            duration={500}
            offset={-80}
            onSetActive={() => setActiveSection('team-info')}
          >
            <ListItemButton
              selected={activeSection === 'team-info'}
              sx={{ '&.Mui-selected': { borderRight: '2px solid', borderColor: 'primary.main' } }}
            >
              <ListItemText primary={t('team-info')} />
            </ListItemButton>
          </Link>
          <Link
            to="event-results"
            smooth
            spy
            duration={500}
            offset={-80}
            onSetActive={() => setActiveSection('event-results')}
          >
            <ListItemButton
              selected={activeSection.startsWith('event')}
              sx={{ '&.Mui-selected': { borderRight: '2px solid', borderColor: 'primary.main' } }}
            >
              <ListItemText primary={t('event-results')} />
            </ListItemButton>
          </Link>
          {events.length > 0 &&
            events.map(event => (
              <Link
                key={`${event.id}`}
                to={`event-${event.slug}`}
                smooth
                spy
                duration={500}
                offset={-80}
                onSetActive={() => setActiveSection(`event-${event.slug}`)}
              >
                <ListItemButton
                  selected={activeSection === `event-${event.slug}`}
                  sx={{
                    pl: 4,
                    '&.Mui-selected': { borderRight: '2px solid', borderColor: 'primary.main' }
                  }}
                >
                  <ListItemText primary={event.name} sx={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </Link>
            ))}
        </List>
      </Paper>
    </Box>
  );
};
