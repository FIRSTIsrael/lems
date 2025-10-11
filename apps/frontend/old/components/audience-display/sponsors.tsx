import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Images from '../../public/assets/audience-display/sponsors';

const Sponsors: React.FC = () => {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => setIndex((index + 1) % Object.values(Images).length), 5000);

    return () => clearTimeout(timeout);
  }, [index]);

  const sponsorImage = useMemo(() => Object.values(Images)[index], [index]);

  return (
    <Stack
      height="100%"
      width="100%"
      position="absolute"
      top={0}
      left={0}
      sx={{
        backgroundImage: 'url(/assets/audience-display/season-background.webp)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
      flexWrap="wrap"
      alignItems="center"
      justifyContent="center"
    >
      <Box px={8} py={2} bgcolor="#f7f8f9" borderRadius={4} mb={20}>
        <Typography variant="h1" fontSize="7rem">
          תודה רבה לשותפים שלנו!
        </Typography>
      </Box>
      <Image src={sponsorImage} style={{ height: '60%', width: '80%' }} alt="תמונת ספונסר" />
    </Stack>
  );
};

export default Sponsors;
