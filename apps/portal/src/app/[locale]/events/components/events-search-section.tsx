'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Stack, TextField, InputAdornment, Chip } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/portal';

interface EventsSearchSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterTab: number;
  onFilterChange: (tab: number) => void;
  events: EventSummary[];
}

export default function EventsSearchSection({
  searchValue,
  onSearchChange,
  filterTab,
  onFilterChange,
  events
}: EventsSearchSectionProps) {
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
            onClick={() => onFilterChange(0)}
            color={filterTab === 0 ? 'primary' : 'default'}
            variant={filterTab === 0 ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label={t('filters.active', { count: eventCounts.active })}
            onClick={() => onFilterChange(1)}
            color={filterTab === 1 ? 'error' : 'default'}
            variant={filterTab === 1 ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label={t('filters.upcoming', { count: eventCounts.upcoming })}
            onClick={() => onFilterChange(2)}
            color={filterTab === 2 ? 'primary' : 'default'}
            variant={filterTab === 2 ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label={t('filters.past', { count: eventCounts.past })}
            onClick={() => onFilterChange(3)}
            color={filterTab === 3 ? 'secondary' : 'default'}
            variant={filterTab === 3 ? 'filled' : 'outlined'}
            clickable
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
