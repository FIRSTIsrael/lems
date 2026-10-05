'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { OpenInNew, Search } from '@mui/icons-material';
import { Coordinates } from '@lems/types/api/coordinates';
import { apiFetch, GoogleMapEmbed } from '@lems/shared';
import { useEvent } from '../../components/event-context';

const GEOCODING_URL = 'https://nominatim.openstreetmap.org/search';

const isSameLocation = (a: Coordinates | null, b: Coordinates | null) =>
  a?.latitude === b?.latitude && a?.longitude === b?.longitude;

const parseCoordinate = (value: string, limit: number) => {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) && Math.abs(number) <= limit
    ? number
    : null;
};

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
const COORDINATE_PATTERNS = [
  new RegExp(`!3d${NUMBER}!4d${NUMBER}`),
  new RegExp(`@${NUMBER},${NUMBER}`),
  new RegExp(String.raw`[?&](?:q|query|ll|destination)=${NUMBER}(?:,|%2C)\s*${NUMBER}`, 'i'),
  new RegExp(String.raw`^\s*${NUMBER}\s*[,\s]\s*${NUMBER}\s*$`)
];

/**
 * Parses pasted text such as '32.0853, 34.7818' (copied from Google Maps) or a Google Maps link.
 */
const parseCoordinatesText = (text: string): Coordinates | null => {
  for (const pattern of COORDINATE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const latitude = parseCoordinate(match[1], 90);
    const longitude = parseCoordinate(match[2], 180);
    if (latitude !== null && longitude !== null) return { latitude, longitude };
  }
  return null;
};

const toQueryString = (query: Coordinates | string) =>
  typeof query === 'string' ? query : `${query.latitude},${query.longitude}`;

export const EventLocationEditor: React.FC = () => {
  const event = useEvent();
  const t = useTranslations('pages.events.edit.location-editor');
  const locale = useLocale();
  const router = useRouter();

  const [savedValue, setSavedValue] = useState<Coordinates | null>(event.coordinates);
  const [value, setValue] = useState<Coordinates | null>(event.coordinates);
  const [preview, setPreview] = useState<Coordinates | string>(event.coordinates ?? event.location);
  const [latitudeInput, setLatitudeInput] = useState(event.coordinates?.latitude.toString() ?? '');
  const [longitudeInput, setLongitudeInput] = useState(
    event.coordinates?.longitude.toString() ?? ''
  );
  const [searchQuery, setSearchQuery] = useState(event.location);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const updateLocation = (coordinates: Coordinates | null) => {
    setValue(coordinates);
    setLatitudeInput(coordinates?.latitude.toString() ?? '');
    setLongitudeInput(coordinates?.longitude.toString() ?? '');
    setPreview(coordinates ?? (searchQuery.trim() || event.location));
  };

  const handleCoordinateInput = (latitudeText: string, longitudeText: string) => {
    setLatitudeInput(latitudeText);
    setLongitudeInput(longitudeText);
    const latitude = parseCoordinate(latitudeText, 90);
    const longitude = parseCoordinate(longitudeText, 180);
    if (latitude !== null && longitude !== null) {
      setValue({ latitude, longitude });
      setPreview({ latitude, longitude });
    } else if (!latitudeText.trim() && !longitudeText.trim()) {
      setValue(null);
    }
  };

  const handleCoordinatesPaste = (e: React.ClipboardEvent) => {
    const coordinates = parseCoordinatesText(e.clipboardData.getData('text'));
    if (!coordinates) return;
    e.preventDefault();
    updateLocation(coordinates);
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setAlert(null);
    try {
      const params = new URLSearchParams({ q: query, format: 'jsonv2', limit: '1' });
      const response = await fetch(`${GEOCODING_URL}?${params}`, {
        headers: { 'Accept-Language': locale }
      });
      if (!response.ok) throw new Error(response.statusText);

      const [result] = (await response.json()) as { lat: string; lon: string }[];
      if (result) {
        updateLocation({ latitude: Number(result.lat), longitude: Number(result.lon) });
      } else {
        setPreview(query);
        setAlert({ type: 'error', message: t('messages.no-results') });
      }
    } catch {
      setPreview(query);
      setAlert({ type: 'error', message: t('messages.search-error') });
    } finally {
      setIsSearching(false);
    }
  };

  const latitudeError = latitudeInput !== '' && parseCoordinate(latitudeInput, 90) === null;
  const longitudeError = longitudeInput !== '' && parseCoordinate(longitudeInput, 180) === null;
  const isIncomplete = !latitudeInput.trim() !== !longitudeInput.trim();

  const handleSave = async (coordinates: Coordinates | null) => {
    setIsSaving(true);
    setAlert(null);

    const result = await apiFetch(`/admin/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates })
    });

    if (result.ok) {
      setSavedValue(coordinates);
      setAlert({ type: 'success', message: t('messages.save-success') });
      router.refresh();
    } else {
      setAlert({ type: 'error', message: t('messages.save-error') });
    }
    setIsSaving(false);
  };

  const hasChanges = !isSameLocation(value, savedValue);
  const googleMapsUrl = `https://www.google.com/maps/search/?${new URLSearchParams({
    api: '1',
    query: toQueryString(preview)
  })}`;

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6">{t('title')}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {t('description')}
      </Typography>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GoogleMapEmbed query={preview} language={locale} height={360} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <TextField
              label={t('fields.search.label')}
              placeholder={t('fields.search.placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        edge="end"
                        aria-label={t('fields.search.label')}
                      >
                        {isSearching ? <CircularProgress size={20} /> : <Search />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <Button
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNew />}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('actions.open-google-maps')}
            </Button>

            <Stack direction="row" spacing={2}>
              <TextField
                label={t('fields.latitude')}
                value={latitudeInput}
                onChange={e => handleCoordinateInput(e.target.value, longitudeInput)}
                onPaste={handleCoordinatesPaste}
                error={latitudeError}
                fullWidth
                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              />
              <TextField
                label={t('fields.longitude')}
                value={longitudeInput}
                onChange={e => handleCoordinateInput(latitudeInput, e.target.value)}
                onPaste={handleCoordinatesPaste}
                error={longitudeError}
                fullWidth
                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              />
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('hint')}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => updateLocation(null)}
                disabled={isSaving || (!value && !latitudeInput && !longitudeInput)}
              >
                {t('actions.clear')}
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSave(value)}
                disabled={
                  isSaving || !hasChanges || latitudeError || longitudeError || isIncomplete
                }
                startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
              >
                {isSaving ? t('actions.saving') : t('actions.save')}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};
