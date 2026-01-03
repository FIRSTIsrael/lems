'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
  lighten
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const isProduction = process.env.NODE_ENV === 'production';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LemsError({ error, reset }: ErrorProps) {
  const t = useTranslations('pages.error');
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    console.error('LEMS Error:', error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Stack
          spacing={4}
          alignItems="center"
          textAlign="center"
          sx={{
            py: { xs: 4, md: 6 }
          }}
        >
          {/* Error Icon with subtle animation */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: lighten(theme.palette.error.main, 0.9),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1
                },
                '50%': {
                  opacity: 0.7
                }
              }
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 56,
                color: 'error.main'
              }}
            />
          </Box>

          {/* Error Title */}
          <Stack spacing={2}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="800"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                color: 'text.primary'
              }}
            >
              {t('title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', sm: '1rem' },
                color: 'text.secondary',
                lineHeight: 1.6,
                maxWidth: '90%',
                mx: 'auto'
              }}
            >
              {t('description')}
            </Typography>
          </Stack>

          {/* Error Details Card  */}
          {error?.message && (
            <Box
              sx={{
                width: '100%',
                p: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                textAlign: 'left'
              }}
            >
              {!isProduction && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    color: 'text.secondary',
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {t('technical-details')}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'text.secondary',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {error?.message}
              </Typography>
              {error?.digest && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'text.disabled',
                    mt: 1,
                    fontSize: '0.75rem'
                  }}
                >
                  Error ID: {error.digest}
                </Typography>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="center"
            spacing={2}
            sx={{ width: '100%', pt: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => router.push('/')}
              fullWidth={isMobile}
              sx={{
                px: { xs: 3, sm: 4 },
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 1,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 2,
                  bgcolor: 'primary.dark'
                }
              }}
            >
              {t('back-home')}
            </Button>

            <Button
              variant="outlined"
              onClick={reset}
              fullWidth={isMobile}
              sx={{
                px: { xs: 3, sm: 4 },
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 1,
                textTransform: 'none',
                border: '2px solid',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.light',
                  borderColor: 'primary.dark'
                }
              }}
            >
              {t('try-again')}
            </Button>
          </Stack>

          {/* Support Text */}
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}
          >
            {t('support-text')}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
