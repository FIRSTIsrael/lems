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

const ALL_STATUSES: ScoresheetStatus[] = ['empty', 'draft', 'completed', 'gp', 'submitted'];

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
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ flex: 1 }}
          >
            <TextField
              label={t('filters.search-label')}
              placeholder={t('filters.search-placeholder')}
              value={filterOptions.searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size="small"
              variant="outlined"
              sx={{ flex: '1 1 200px', minWidth: 200 }}
            />

            <TextField
              select
              label={t('filters.status-label') || 'Status'}
              value={filterOptions.statusFilter}
              onChange={handleStatusChange}
              size="small"
              variant="outlined"
              sx={{ minWidth: 200 }}
              SelectProps={{
                multiple: true,
                renderValue: (selected: any) => {
                  if ((selected as string[]).length === 0) return t('filters.all-statuses');
                  return (selected as string[]).map(s => t(`scoresheet-status.${s}`)).join(', ');
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
              sx={{
                minWidth: 180,
                textTransform: 'none',
                fontWeight: 500,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              {t('filters.escalated-only')}
              {escalatedScoresheets.length > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    backgroundColor: 'warning.main',
                    color: 'warning.contrastText',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.75,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    minWidth: '1.5rem',
                    textAlign: 'center'
                  }}
                >
                  {escalatedScoresheets.length}
                </Box>
              )}
            </ToggleButton>
          </Stack>

          <Box sx={{ flex: '0 0 auto', ml: 1 }}>
            <ScoresheetStatusLegend />
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
