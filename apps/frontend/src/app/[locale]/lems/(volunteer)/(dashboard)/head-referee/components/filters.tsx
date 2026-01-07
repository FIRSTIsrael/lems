'use client';


import { useTranslations } from 'next-intl';
import {
  Stack,
  TextField,
  MenuItem,
  Checkbox,
  ListItemText,
  ToggleButton,
  Paper,
  Box
} from '@mui/material';
import type { ScoresheetStatus } from '../graphql/types';
import { useHeadRefereeData } from './head-referee-context';
import { ScoresheetStatusLegend } from './scoresheet-status-legend';

const ALL_STATUSES: ScoresheetStatus[] = ['empty', 'in-progress', 'completed', 'gp', 'submitted'];

export function Filters() {
  const t = useTranslations('pages.head-referee');
  const {
    filterOptions,
    setSearchQuery,
    setStatusFilter,
    setShowEscalatedOnly,
    escalatedScoresheets
  } = useHeadRefereeData();

  const handleStatusChange = (event: any) => {
    const {
      target: { value }
    } = event;
    setStatusFilter(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ position: 'relative' }}
        >
          <Box sx={{ position: 'absolute', right: 0, top: -8 }}>
            <ScoresheetStatusLegend />
          </Box>
          <TextField
            label={t('filters.search-label')}
            placeholder={t('filters.search-placeholder')}
            value={filterOptions.searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: '1 1 200px', minWidth: 200 }}
          />

          <TextField
            select
            label={t('filters.status-label') || 'Status'}
            value={filterOptions.statusFilter}
            onChange={handleStatusChange}
            size="small"
            sx={{ minWidth: 200 }}
            SelectProps={{
              multiple: true,
              renderValue: (selected: any) => {
                if ((selected as string[]).length === 0) return t('filters.all-statuses');
                return (selected as string[])
                  .map(s => t(`scoresheet-status.${s}`))
                  .join(', ');
              }
            }}
          >
            {ALL_STATUSES.map(status => (
              <MenuItem key={status} value={status}>
                <Checkbox checked={filterOptions.statusFilter.indexOf(status) > -1} />
                <ListItemText primary={t(`scoresheet-status.${status}`)} />
              </MenuItem>
            ))}
          </TextField>

          <ToggleButton
            value="escalated"
            selected={filterOptions.showEscalatedOnly}
            onChange={() => setShowEscalatedOnly(!filterOptions.showEscalatedOnly)}
            size="small"
            color="warning"
            sx={{ minWidth: 180 }}
          >
            {t('filters.escalated-only')}
            {escalatedScoresheets.length > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {escalatedScoresheets.length}
              </Box>
            )}
          </ToggleButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
