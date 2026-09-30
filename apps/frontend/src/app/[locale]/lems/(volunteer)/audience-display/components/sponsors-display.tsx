'use client';

import { Box } from '@mui/material';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import sponsorImages from '../../../../../../../public/assets/audience-display/sponsors';

export const SponsorsDisplay = () => {
  const [index, setIndex] = useState<number>(0);

  const sponsorsData = Object.keys(sponsorImages);

  // Cycle through sponsors every 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIndex(prevIndex => (prevIndex + 1) % sponsorsData.length);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [index, sponsorsData.length]);

  const currentSponsor = useMemo(() => {
    if (sponsorsData.length === 0) return null;
    const sponsorKey = sponsorsData[index];
    return sponsorImages[sponsorKey] || null;
  }, [index, sponsorsData]);

  if (!currentSponsor) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/assets/audience-display/audience-display-background.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90%',
          maxWidth: '1200px',
          pt: '10vh',
          height: '40vh'
        }}
      >
        <Image
          key={`sponsor-${index}`}
          src={currentSponsor}
          alt="Sponsor Logo"
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </Box>
    </Box>
  );
};
