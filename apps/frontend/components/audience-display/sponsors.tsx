import { Box } from '@mui/material';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const Sponsors: React.FC = () => {
  const sponsors = useMemo(() => ['john', 'wifi', 'ofek'], []);
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => setIndex((index + 1) % sponsors.length), 5000);

    return () => clearTimeout(timeout);
  }, [index, sponsors.length]);

  const sponsorImage = useMemo(
    () => `/assets/audience-display/sponsors/${sponsors[index]}.webp`,
    [sponsors, index]
  );

  return (
    <Box
      height="100%"
      width="100%"
      position="absolute"
      top={0}
      left={0}
      sx={{
        backgroundImage: 'url(/assets/audience-display/sponsors-background.webp)',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Image
        src={sponsorImage}
        width={600}
        height={600}
        style={{ position: 'absolute', top: 375, left: 660 }}
        alt="תמונת ספונסר"
      />
    </Box>
  );
};

export default Sponsors;
