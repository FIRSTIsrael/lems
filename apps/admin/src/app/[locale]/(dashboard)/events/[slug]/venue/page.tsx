'use client';

import { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useEvent } from '../layout';
import DivisionSelector from '../components/division-selector';
import PitMapManager from './components/pit-map-manager';
import AssetManager from './components/asset-manager';

const VenuePage: React.FC = () => {
  const t = useTranslations('pages.events.venue');
  const event = useEvent();
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');

  const { data: divisions = [], mutate } = useSWR(`/admin/events/${event.slug}/divisions`);

  if (!selectedDivisionId && divisions.length > 0) {
    setSelectedDivisionId(divisions[0].id);
  }

  const selectedDivision = divisions.find((d: { id: string }) => d.id === selectedDivisionId);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h1" gutterBottom>
        {t('title', { eventName: event.name })}
      </Typography>

      {divisions.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <DivisionSelector
            divisions={divisions}
            selectedDivisionId={selectedDivisionId}
            onDivisionChange={setSelectedDivisionId}
          />
        </Box>
      )}

      {selectedDivision && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 12, lg: 6, xl: 6 }}>
            <AssetManager divisionId={selectedDivision.id} assetType="rooms" />
          </Grid>

          <Grid size={{ xs: 12, md: 12, lg: 6, xl: 6 }}>
            <AssetManager key="tables" divisionId={selectedDivision.id} assetType="tables" />
          </Grid>

          <Grid size={12}>
            <PitMapManager key="rooms" division={selectedDivision} onDivisionUpdate={mutate} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default VenuePage;
