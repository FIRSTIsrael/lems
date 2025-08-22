'use client';

import { useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useEvent } from '../layout';
import DivisionSelector from './components/division-selector';
import RoomsManager from './components/rooms-manager';
import TablesManager from './components/tables-manager';
import PitMapManager from './components/pit-map-manager';

const VenuePage: React.FC = () => {
  const t = useTranslations('pages.events.venue');
  const event = useEvent();
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');

  const { data: divisions = [] } = useSWR(`/admin/events/${event.slug}/divisions`);

  // Set default division if not set and divisions are loaded
  if (!selectedDivisionId && divisions.length > 0) {
    setSelectedDivisionId(divisions[0].id);
  }

  const selectedDivision = divisions.find((d: { id: string }) => d.id === selectedDivisionId);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('title', { eventName: event.name })}
      </Typography>

      {selectedDivision && (
        <Grid container spacing={3}>
          {divisions.length > 1 && (
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <DivisionSelector
                  divisions={divisions}
                  selectedDivisionId={selectedDivisionId}
                  onDivisionChange={setSelectedDivisionId}
                />
              </Paper>
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 12, lg: 6, xl: 6 }}>
            <RoomsManager divisionId={selectedDivision.id} />
          </Grid>

          <Grid size={{ xs: 12, md: 12, lg: 6, xl: 6 }}>
            <TablesManager divisionId={selectedDivision.id} />
          </Grid>

          <Grid size={12}>
            <PitMapManager divisionId={selectedDivision.id} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default VenuePage;
