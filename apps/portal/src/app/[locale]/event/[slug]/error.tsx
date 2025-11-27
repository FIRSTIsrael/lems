'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import { Event as EventIcon, ErrorOutline } from '@mui/icons-material';

interface EventErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EventError({ error, reset }: EventErrorProps) {
  const t = useTranslations('pages.event');

  useEffect(() => {
    console.error('Event page error:', error);
  }, [error]);

  const isNotFound = error.message?.includes('404') || error.message?.includes('not found');
  const translationKey = isNotFound ? 'not-found' : 'server-error';
  const Icon = isNotFound ? EventIcon : ErrorOutline;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: 80,
              borderRadius: 2,
              bgcolor: isNotFound ? 'rgba(0, 61, 106, 0.08)' : 'rgba(244, 67, 54, 0.08)'
            }}
          >
            <Icon
              sx={{
                fontSize: 48,
                color: isNotFound ? 'primary.main' : 'error.main'
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            {t(`${translationKey}.title`)}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            {t(`${translationKey}.description`)}
          </Typography>

          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                width: '100%'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  wordBreak: 'break-word',
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem'
                }}
              >
                {error.message}
                {error.digest && ` (Digest: ${error.digest})`}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2, width: '100%' }}>
            <Button
              component={Link}
              href="/events"
              variant="contained"
              startIcon={<EventIcon />}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {t(`${translationKey}.back-to-events`)}
            </Button>

            {!isNotFound && (
              <Button
                onClick={reset}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                {t(`${translationKey}.retry`)}
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
