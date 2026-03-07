'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { Add, Search, ViewModule, ViewList } from '@mui/icons-material';
import { Season, EventSummary } from '@lems/types/api/admin';
import { Flag } from '@lems/shared';
import Link from 'next/link';
import { EventCard } from './event-card';
import { EventListItem } from './event-list-item';

interface EventGridProps {
  season: Season;
  disableCreation?: boolean;
  shouldFetch?: boolean;
}

export const EventGrid: React.FC<EventGridProps> = ({
  season,
  disableCreation = false,
  shouldFetch = true
}) => {
  const t = useTranslations('pages.events.grid');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [pinnedEventIds, setPinnedEventIds] = useState<Set<string>>(new Set());

  const { data: events = [], isLoading } = useSWR<EventSummary[]>(
    shouldFetch ? `/admin/events/season/${season.id}/summary` : null
  );

  const availableRegions = useMemo(() => {
    const regions = new Set(events.map(event => event.region));
    return Array.from(regions).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by region
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(event => selectedRegions.includes(event.region));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.name.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.divisions.some(div => div.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [events, searchQuery, selectedRegions]);

  const { pinnedEvents, unpinnedEvents } = useMemo(() => {
    const pinned = filteredEvents.filter(event => pinnedEventIds.has(event.id));
    const unpinned = filteredEvents.filter(event => !pinnedEventIds.has(event.id));
    return { pinnedEvents: pinned, unpinnedEvents: unpinned };
  }, [filteredEvents, pinnedEventIds]);

  const handleTogglePin = (eventId: string) => {
    setPinnedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleRegionChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedRegions(typeof value === 'string' ? value.split(',') : value);
  };

  const handleRemoveRegion = (regionToRemove: string) => {
    setSelectedRegions(prev => prev.filter(region => region !== regionToRemove));
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'text.secondary'
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <>
      {/* Search, Region Filter, and View Toggle */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder={t('search-placeholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 250, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="region-filter-label">{t('filter-by-region')}</InputLabel>
            <Select
              labelId="region-filter-label"
              multiple
              value={selectedRegions}
              onChange={handleRegionChange}
              input={<OutlinedInput label={t('filter-by-region')} />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => (
                    <Chip
                      key={value}
                      icon={<Flag region={value} size={16} />}
                      label={value}
                      size="small"
                      onDelete={() => handleRemoveRegion(value)}
                      onMouseDown={e => e.stopPropagation()}
                    />
                  ))}
                </Box>
              )}
            >
              {availableRegions.map(region => (
                <MenuItem key={region} value={region}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Flag region={region} size={20} />
                    <Typography>{region}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid" aria-label={t('view-grid')}>
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="list" aria-label={t('view-list')}>
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {selectedRegions.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              {t('filtering-by-regions')}:
            </Typography>
            {selectedRegions.map(region => (
              <Chip
                key={region}
                icon={<Flag region={region} size={16} />}
                label={region}
                size="small"
                onDelete={() => handleRemoveRegion(region)}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
      </Stack>

      {/* Pinned Events Section */}
      {pinnedEvents.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {t('pinned-events')}
          </Typography>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {pinnedEvents.map(event => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
                  <EventCard
                    {...event}
                    isPinned
                    onTogglePin={handleTogglePin}
                    onDelete={() => {}}
                    onCopy={() => {}}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box>
              {pinnedEvents.map(event => (
                <EventListItem key={event.id} {...event} isPinned onTogglePin={handleTogglePin} />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* All Events Section */}
      {unpinnedEvents.length > 0 && (
        <Box>
          {pinnedEvents.length > 0 && (
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {t('all-events')}
            </Typography>
          )}
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {unpinnedEvents.map(event => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
                  <EventCard
                    {...event}
                    isPinned={false}
                    onTogglePin={handleTogglePin}
                    onDelete={() => {}}
                    onCopy={() => {}}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box>
              {unpinnedEvents.map(event => (
                <EventListItem
                  key={event.id}
                  {...event}
                  isPinned={false}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {filteredEvents.length === 0 && events.length > 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('empty-state.no-results')}
          </Typography>
          <Typography variant="body2">{t('empty-state.no-results-description')}</Typography>
        </Box>
      )}

      {events.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('empty-state.no-events')}
          </Typography>
          {!disableCreation && (
            <>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {t('empty-state.no-events-description')}
              </Typography>
              <Button
                variant="contained"
                component={Link}
                href="/events/create"
                startIcon={<Add />}
              >
                {t('empty-state.create-new-event')}
              </Button>
            </>
          )}
        </Box>
      )}
    </>
  );
};
