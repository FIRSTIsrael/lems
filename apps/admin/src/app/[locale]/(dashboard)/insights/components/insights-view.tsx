'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { EditionBadge } from '@lems/shared';
import { getEdition } from '@lems/shared/edition';
import { useAwardTranslations } from '@lems/localization';
import { INSIGHTS_STAGES, InsightsStage } from '@lems/types/api/admin';
import { useInsightsEvents } from '../lib/hooks';
import { Dashboard } from './dashboard';
import { Explorer } from './explorer';
import { useStageLabel } from './widgets/common';

const TABS = ['overview', 'robot-game', 'judging', 'explorer'] as const;
type InsightsTab = (typeof TABS)[number];
const ALL_STAGES = 'all';

export const InsightsView: React.FC = () => {
  const t = useTranslations('pages.insights');
  const getStage = useStageLabel();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: events, isLoading, error } = useInsightsEvents();

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const completedEvents = events?.filter(event => event.completed) ?? [];
  const event =
    events?.find(e => e.id === searchParams.get('event') && e.completed) ?? completedEvents[0];
  const division =
    event?.divisions.find(d => d.id === searchParams.get('division')) ?? event?.divisions[0];
  const tab: InsightsTab = TABS.find(tab => tab === searchParams.get('tab')) ?? 'overview';
  const stageParam = searchParams.get('stage');
  const stage: InsightsStage | undefined =
    stageParam === ALL_STAGES
      ? undefined
      : (INSIGHTS_STAGES.find(s => s === stageParam) ?? 'RANKING');
  const { getName: getAwardName } = useAwardTranslations(
    division ? getEdition(division) : undefined
  );

  if (error) return <Alert severity="error">{t('errors.load-events')}</Alert>;

  return (
    <Stack spacing={3} sx={{ pb: 4 }}>
      <Typography variant="h1">{t('title')}</Typography>

      <Paper sx={{ p: 2.5 }}>
        {isLoading ? (
          <Skeleton variant="rounded" height={40} />
        ) : (
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Autocomplete
                options={events ?? []}
                value={event ?? null}
                groupBy={option => option.seasonName ?? ''}
                getOptionLabel={option => option.name}
                getOptionDisabled={option => !option.completed}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, value) => value && setParams({ event: value.id, division: null })}
                disableClearable={!!event}
                getOptionKey={option => option.id}
                renderOption={({ key, ...props }, option) => (
                  <Box component="li" key={key} {...props}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ flex: 1 }}>{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.startDate.toLocaleDateString()}
                      </Typography>
                      {!option.completed && <Chip size="small" label={t('not-completed')} />}
                    </Stack>
                  </Box>
                )}
                renderInput={params => <TextField {...params} label={t('event')} />}
              />
            </Grid>
            {event && event.divisions.length > 1 && (
              <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('division')}</InputLabel>
                  <Select
                    label={t('division')}
                    value={division?.id ?? ''}
                    onChange={e => setParams({ division: e.target.value })}
                  >
                    {event.divisions.map(d => (
                      <MenuItem key={d.id} value={d.id}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Box
                            sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: d.color }}
                          />
                          <span>{d.name}</span>
                          <EditionBadge isFuture={d.futureEdition} />
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {event && division && (
              <Grid size={{ xs: 12, lg: 'grow' }}>
                <Stack
                  direction="row"
                  spacing={2}
                  useFlexGap
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap'
                  }}
                >
                  <Tabs
                    value={tab}
                    onChange={(_, value) => setParams({ tab: value })}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {TABS.map(tab => (
                      <Tab
                        key={tab}
                        value={tab}
                        label={
                          tab === 'robot-game'
                            ? getAwardName('robot-performance')
                            : t(`tabs.${tab}`)
                        }
                      />
                    ))}
                  </Tabs>
                  {tab === 'robot-game' && (
                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={stage ?? ALL_STAGES}
                      onChange={(_, value) => value && setParams({ stage: value })}
                    >
                      <ToggleButton value={ALL_STAGES}>{t('all-stages')}</ToggleButton>
                      {INSIGHTS_STAGES.map(s => (
                        <ToggleButton key={s} value={s}>
                          {getStage(s)}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}
                </Stack>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      {!isLoading && !event && <Alert severity="info">{t('no-completed-events')}</Alert>}

      {event && division && (
        <>
          {tab === 'explorer' ? (
            <Explorer key={division.id} divisionId={division.id} edition={getEdition(division)} />
          ) : (
            <Dashboard
              key={`${division.id}-${tab}`}
              dashboard={tab}
              divisionId={division.id}
              edition={getEdition(division)}
              stage={stage}
            />
          )}
        </>
      )}
    </Stack>
  );
};
