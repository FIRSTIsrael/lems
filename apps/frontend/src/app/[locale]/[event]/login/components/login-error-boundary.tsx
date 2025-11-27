'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Container, Paper, Typography, Button, Alert, alpha } from '@mui/material';
import {
  ErrorOutlineRounded as ErrorIcon,
  RefreshRounded as RefreshIcon
} from '@mui/icons-material';

interface LoginErrorBoundaryProps {
  children: React.ReactNode;
}

interface LoginErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class LoginErrorBoundary extends React.Component<
  LoginErrorBoundaryProps,
  LoginErrorBoundaryState
> {
  constructor(props: LoginErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): LoginErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Login page error:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <LoginErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface LoginErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function LoginErrorFallback({ error, onReset }: LoginErrorFallbackProps) {
  const t = useTranslations('pages.login');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme =>
          `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.light, 0.1)} 50%, ${alpha(theme.palette.error.main, 0.03)} 100%)`,
        borderRadius: 3,
        py: 4,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: theme => alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            border: theme => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            boxShadow: theme =>
              `0 8px 32px ${alpha(theme.palette.error.main, 0.12)}, 0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ErrorIcon
              sx={{
                fontSize: 56,
                color: 'error.main',
                mb: 2,
                opacity: 0.9
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {t('errors.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('errors.description')}
            </Typography>
          </Box>

          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: theme => alpha(theme.palette.error.main, 0.08),
              color: 'error.dark',
              '& .MuiAlert-icon': {
                color: 'error.main'
              }
            }}
          >
            {error?.message || t('errors.unknown')}
          </Alert>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            {t('errors.support-text')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => (window.location.href = '/')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {t('errors.back-home')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {t('errors.try-again')}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
