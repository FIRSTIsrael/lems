'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Stack,
  TextField,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  ToggleButton,
  Typography,
  Paper,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status: ScoresheetStatus) => {
    const newStatuses = filterOptions.statusFilter.includes(status)
      ? filterOptions.statusFilter.filter(s => s !== status)
      : [...filterOptions.statusFilter, status];
    setStatusFilter(newStatuses);
  };

  const getStatusFilterLabel = () => {
    if (filterOptions.statusFilter.length === 0) {
      return t('filters.all-statuses');
    }
    if (filterOptions.statusFilter.length === 1) {
      return t(`scoresheet-status.${filterOptions.statusFilter[0]}`);
    }
    return t('filters.statuses-selected', { count: filterOptions.statusFilter.length });
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

          <Button
            onClick={handleClick}
            variant="outlined"
            endIcon={<ExpandMoreIcon />}
            startIcon={<FilterAltIcon />}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {getStatusFilterLabel()}
            </Typography>
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {ALL_STATUSES.map(status => (
              <MenuItem key={status} onClick={() => handleStatusChange(status)}>
                <Checkbox checked={filterOptions.statusFilter.includes(status)} />
                <ListItemText primary={t(`scoresheet-status.${status}`)} />
              </MenuItem>
            ))}
          </Menu>

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
