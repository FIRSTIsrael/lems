'use client';

import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Box, Grid } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { EventPageTitle } from '../components/event-page-title';
import { useEvent } from '../components/event-context';
import { DivisionSelector } from '../components/division-selector';
import { PitMapManager } from './components/pit-map-manager';
import { AssetManager } from './components/asset-manager';
import { ScheduleExists } from './components/schedule-exists';
import { PracticeTablesSection } from './components/practice-tables-section';

const VenuePage: React.FC = () => {
  const t = useTranslations('pages.events.venue');
  const event = useEvent();
  const searchParams = useSearchParams();

  const { data: divisions = [], mutate } = useSWR<Division[]>(
    `/admin/events/${event.id}/divisions`,
    { suspense: true, fallbackData: [] }
  );

  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;
  const selectedDivision = divisions.find(division => division.id === selectedDivisionId);

  return (
    <Box sx={{ p: 3 }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />

      {divisions.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <DivisionSelector divisions={divisions} />
        </Box>
      )}

      {selectedDivision && <ScheduleExists division={selectedDivision} />}

      {selectedDivision && !selectedDivision.hasSchedule && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 12, lg: 6, xl: 6 }}>
            <AssetManager division={selectedDivision} assetType="rooms" />
          </Grid>

          <Grid size={{ xs: 12, md: 12, lg: 6, xl: 6 }}>
            <AssetManager key="tables" division={selectedDivision} assetType="tables" />
          </Grid>
        </Grid>
      )}

      {selectedDivision && (
        <Grid container spacing={3} sx={{ mt: 3, alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <PitMapManager key="pit-map" division={selectedDivision} onDivisionUpdate={mutate} />
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <PracticeTablesSection key="practice-tables" division={selectedDivision} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default VenuePage;
