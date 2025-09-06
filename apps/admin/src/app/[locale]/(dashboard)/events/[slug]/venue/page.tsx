'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Box, Grid } from '@mui/material';
import useSWR from 'swr';
import { EventPageTitle } from '../components/event-page-title';
import { useEvent } from '../components/event-context';
import { DivisionSelector } from '../components/division-selector';
import { PitMapManager } from './components/pit-map-manager';
import { AssetManager } from './components/asset-manager';

const VenuePage: React.FC = () => {
  const t = useTranslations('pages.events.venue');
  const event = useEvent();
  const searchParams = useSearchParams();

  const { data: divisions, mutate } = useSWR(`/admin/events/${event.id}/divisions`, {
    suspense: true,
    fallbackData: []
  });

  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;
  const selectedDivision = divisions.find((d: { id: string }) => d.id === selectedDivisionId);

  return (
    <Box sx={{ p: 3 }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />

      {divisions.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <DivisionSelector divisions={divisions} />
        </Box>
      )}

      {selectedDivision && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 12, lg: 6, xl: 6 }}>
            <AssetManager division={selectedDivision} assetType="rooms" />
          </Grid>

          <Grid size={{ xs: 12, md: 12, lg: 6, xl: 6 }}>
            <AssetManager key="tables" division={selectedDivision} assetType="tables" />
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
