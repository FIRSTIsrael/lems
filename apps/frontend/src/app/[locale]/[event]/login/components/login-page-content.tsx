'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Paper, Container, Box, CircularProgress, alpha } from '@mui/material';
import { useRecaptcha } from '@lems/shared';
import { VolunteerProvider } from './volunteer-context';
import { LoginForm } from './login-form';

interface LoginPageContentProps {
  event: { name: string; slug: string };
  recaptchaRequired: boolean;
}

export function LoginPageContent({ event, recaptchaRequired }: LoginPageContentProps) {
  const t = useTranslations('pages.login');
  useRecaptcha(recaptchaRequired);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 50%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
          <Typography
            variant="h1"
            sx={{
              mb: 1,
              fontWeight: 800,
              background: theme =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: theme => `0 2px 10px ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            {event.name}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {t('subtitle')}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: theme => alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: theme =>
              `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}, 0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`
          }}
        >
          <Suspense
            fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress />
              </Box>
            }
          >
            <VolunteerProvider eventSlug={event.slug}>
              <LoginForm />
            </VolunteerProvider>
          </Suspense>
        </Paper>
      </Container>
    </Box>
  );
}
