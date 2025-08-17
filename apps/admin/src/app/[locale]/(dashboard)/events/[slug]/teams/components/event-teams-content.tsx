'use client';

import { useState } from 'react';
import { Stack, Switch, Typography, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Event } from '@lems/types/api/admin';
import { UnifiedTeamsDataGrid } from './unified-teams-data-grid';
import { SplitTeamsView } from './split-teams-view';
import RegisterTeamsButton from './register-teams-button';

interface EventTeamsContentProps {
  event: Event;
}

// Mock data for now - this will be replaced with real API calls
const MOCK_UNIFIED_TEAMS = [
  {
    id: '1',
    number: 1234,
    name: 'Team Alpha',
    logoUrl: null,
    affiliation: 'School Alpha',
    city: 'City A',
    coordinates: null,
    division: {
      id: 'div1',
      name: 'Division A',
      color: '#FF5722'
    }
  },
  {
    id: '2',
    number: 5678,
    name: 'Team Beta',
    logoUrl: null,
    affiliation: 'School Beta',
    city: 'City B',
    coordinates: null,
    division: {
      id: 'div2',
      name: 'Division B',
      color: '#2196F3'
    }
  },
  {
    id: '3',
    number: 9012,
    name: 'Team Gamma',
    logoUrl: null,
    affiliation: 'School Gamma',
    city: 'City C',
    coordinates: null,
    division: {
      id: 'div1',
      name: 'Division A',
      color: '#FF5722'
    }
  },
  {
    id: '4',
    number: 3456,
    name: 'Team Delta',
    logoUrl: null,
    affiliation: 'School Delta',
    city: 'City D',
    coordinates: null,
    division: {
      id: 'div3',
      name: 'Division C',
      color: '#4CAF50'
    }
  }
];

export default function EventTeamsContent({ event }: EventTeamsContentProps) {
  const t = useTranslations('pages.events.teams');
  const [isUnified, setIsUnified] = useState(true);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h1" gutterBottom>
          {t('title', { eventName: event.name })}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography color={isUnified ? 'primary' : 'text.secondary'}>
            {t('view-toggle.unified')}
          </Typography>
          <Switch
            checked={!isUnified}
            onChange={e => setIsUnified(!e.target.checked)}
            color="primary"
          />
          <Typography color={!isUnified ? 'primary' : 'text.secondary'}>
            {t('view-toggle.split')}
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <RegisterTeamsButton event={event} />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {isUnified ? (
          <UnifiedTeamsDataGrid teams={MOCK_UNIFIED_TEAMS} eventId={event.id} />
        ) : (
          <SplitTeamsView eventId={event.id} />
        )}
      </Box>
    </Box>
  );
}
