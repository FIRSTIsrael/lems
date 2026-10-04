'use client';

import dynamic from 'next/dynamic';
import { Box, Skeleton } from '@mui/material';
import type { LocationMapProps } from './location-map-inner';

export type { LocationMapProps };

// Leaflet requires `window`, so the map is only rendered on the client
const DynamicLocationMap = dynamic(() => import('./location-map-inner'), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" width="100%" height="100%" />
});

export const LocationMap: React.FC<LocationMapProps> = ({ height = 300, ...props }) => (
  <Box
    dir="ltr"
    sx={{
      height,
      width: '100%',
      borderRadius: 1,
      overflow: 'hidden',
      isolation: 'isolate',
      border: 1,
      borderColor: 'divider'
    }}
  >
    <DynamicLocationMap {...props} />
  </Box>
);
