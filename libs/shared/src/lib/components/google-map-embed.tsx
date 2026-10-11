import { Box } from '@mui/material';
import { Coordinates } from '@lems/types/api/coordinates';

interface GoogleMapEmbedProps {
  /** Coordinates, or a free-text query such as an address */
  query: Coordinates | string;
  zoom?: number;
  /** Fixed or responsive height, e.g. `{ xs: 180, md: 220 }` */
  height?: number | string | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | string>>;
  /** Interface language, e.g. 'he' */
  language?: string;
  title?: string;
}

/**
 * Keyless Google Maps iframe embed (display only, no API key or billing required).
 */
export const getGoogleMapEmbedUrl = (query: Coordinates | string, zoom = 16, language?: string) => {
  const q = typeof query === 'string' ? query : `${query.latitude},${query.longitude}`;
  const params = new URLSearchParams({ q, z: zoom.toString(), output: 'embed' });
  if (language) params.set('hl', language);
  return `https://maps.google.com/maps?${params}`;
};

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  query,
  zoom = 16,
  height = 300,
  language,
  title = 'Google Maps'
}) => (
  <Box
    sx={{
      height,
      width: '100%',
      borderRadius: 1,
      overflow: 'hidden',
      border: 1,
      borderColor: 'divider'
    }}
  >
    <iframe
      title={title}
      src={getGoogleMapEmbedUrl(query, zoom, language)}
      width="100%"
      height="100%"
      style={{ border: 0, display: 'block' }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  </Box>
);
