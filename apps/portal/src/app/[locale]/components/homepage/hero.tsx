'use client';

import { useTranslations } from 'next-intl';
import { Box, Container, Typography, Stack, useTheme } from '@mui/material';
import { RichText } from '@lems/localization';

const HeroContainer = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const gradientAngle = theme.direction === 'rtl' ? 225 : 135;
  const backgroundGradient = `linear-gradient(${gradientAngle}deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;
  const backgroundPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <Box
      position="relative"
      overflow="hidden"
      py={8}
      color="white"
      sx={{ backgroundImage: backgroundGradient }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        sx={{ opacity: 0.1, backgroundImage: backgroundPattern }}
      />
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
};

export const Hero = () => {
  const t = useTranslations('pages.index.hero');

  return (
    <HeroContainer>
      <Stack
        spacing={3}
        alignItems={{ xs: 'center', sm: 'flex-start' }}
        textAlign={{ xs: 'center', sm: 'left' }}
      >
        <Typography
          variant="h1"
          fontWeight="bold"
          fontSize={{ xs: '2rem', sm: '2.5rem', md: '3rem' }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant="h5"
          maxWidth={600}
          fontSize={{ xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }}
          sx={{ opacity: 0.9 }}
        >
          <RichText>{tags => t.rich('subtitle', tags)}</RichText>
        </Typography>
      </Stack>
    </HeroContainer>
  );
};
