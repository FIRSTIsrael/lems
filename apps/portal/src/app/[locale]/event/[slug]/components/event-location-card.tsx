'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Box, Button, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Close, Directions, LocationOn } from '@mui/icons-material';
import { Coordinates } from '@lems/types/api/coordinates';
import { GoogleMapEmbed } from '@lems/shared';

interface EventLocationCardProps {
  coordinates: Coordinates;
  location: string;
  region: string;
  onClose: () => void;
}

const MOOVIT_METRO_IDS: Record<string, string> = { IL: '1' };

const getMoovitUrl = (
  { latitude, longitude }: Coordinates,
  destinationName: string,
  region: string,
  language: string
) => {
  const metroId = MOOVIT_METRO_IDS[region];
  const params = [
    `to=${encodeURIComponent(destinationName)}`,
    `tll=${latitude}_${longitude}`,
    ...(metroId ? [`metroId=${metroId}`] : []),
    `lang=${language}`
  ];
  return `https://moovitapp.com/?${params.join('&')}`;
};

const getNavigationLinks = (
  coordinates: Coordinates,
  destinationName: string,
  region: string,
  language: string
) => {
  const point = `${coordinates.latitude},${coordinates.longitude}`;

  return [
    { name: 'Google Maps', href: `https://www.google.com/maps/dir/?api=1&destination=${point}` },
    { name: 'Waze', href: `https://waze.com/ul?ll=${point}&navigate=yes` },
    { name: 'Moovit', href: getMoovitUrl(coordinates, destinationName, region, language) },
    { name: 'Apple Maps', href: `https://maps.apple.com/?daddr=${point}` }
  ];
};

export const EventLocationCard: React.FC<EventLocationCardProps> = ({
  coordinates,
  location,
  region,
  onClose
}) => {
  const t = useTranslations('pages.event.navigation');
  const locale = useLocale();

  const closeButton = (
    <Tooltip title={t('close')}>
      <IconButton size="small" onClick={onClose} aria-label={t('close')}>
        <Close fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ position: 'relative' }}>
        <GoogleMapEmbed
          query={coordinates}
          height={{ xs: 180, md: 220 }}
          language={locale}
          title={location}
        />
        <Box
          sx={{
            display: { md: 'none' },
            position: 'absolute',
            top: 8,
            insetInlineEnd: 8,
            bgcolor: 'background.paper',
            borderRadius: '50%',
            boxShadow: 2
          }}
        >
          {closeButton}
        </Box>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.5, md: 2 }}
        sx={{ mt: 1.5, alignItems: { md: 'center' } }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            flexGrow: 1,
            minWidth: 0
          }}
        >
          <LocationOn color="primary" />
          <Typography variant="body1" sx={{ fontWeight: 500, flexGrow: 1 }}>
            {location}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flexShrink: 0 }}
        >
          <Directions fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {t('directions')}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 1,
            width: { xs: '100%', md: 480 },
            flexShrink: 0
          }}
        >
          {getNavigationLinks(coordinates, location, region, locale).map(link => (
            <Button
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              sx={{ px: 0.5, lineHeight: 1.2, whiteSpace: 'normal', textAlign: 'center' }}
            >
              {link.name}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>{closeButton}</Box>
      </Stack>
    </Paper>
  );
};
