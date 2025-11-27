'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Stack, TextField, InputAdornment, Chip } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/portal';
import { EventFilter } from '../event-filter';

interface EventsSearchSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterTab: EventFilter;
  onFilterChange: (tab: EventFilter) => void;
  events: EventSummary[];
}

export const EventsSearchSection: React.FC<EventsSearchSectionProps> = ({
  searchValue,
  onSearchChange,
  filterTab,
  onFilterChange,
  events
}) => {
  const t = useTranslations('pages.events');

  const eventCounts = useMemo(() => {
    return events.reduce(
      (counts, event) => {
        counts.all++;
        if (event.status in counts) counts[event.status as keyof typeof counts]++;
        return counts;
      },
      { all: 0, active: 0, upcoming: 0, past: 0 }
    );
  }, [events]);

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          placeholder={t('search.placeholder')}
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={t('filters.all', { count: eventCounts.all })}
            onClick={() => onFilterChange(EventFilter.ALL)}
            color={filterTab === EventFilter.ALL ? 'primary' : 'default'}
            variant={filterTab === EventFilter.ALL ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label={t('filters.active', { count: eventCounts.active })}
            onClick={() => onFilterChange(EventFilter.ACTIVE)}
            color={filterTab === EventFilter.ACTIVE ? 'error' : 'default'}
            variant={filterTab === EventFilter.ACTIVE ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label={t('filters.upcoming', { count: eventCounts.upcoming })}
            onClick={() => onFilterChange(EventFilter.UPCOMING)}
            color={filterTab === EventFilter.UPCOMING ? 'primary' : 'default'}
            variant={filterTab === EventFilter.UPCOMING ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label={t('filters.past', { count: eventCounts.past })}
            onClick={() => onFilterChange(EventFilter.PAST)}
            color={filterTab === EventFilter.PAST ? 'secondary' : 'default'}
            variant={filterTab === EventFilter.PAST ? 'filled' : 'outlined'}
            clickable
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
