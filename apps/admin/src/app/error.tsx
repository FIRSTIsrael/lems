'use client';

import { Container, Paper, Typography } from '@mui/material';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <Container
      maxWidth="md"
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)'
      }}
    >
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h2" fontWeight={600} gutterBottom>
          Oops! Something went wrong, please try again.
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }} fontSize="1.25rem">
          {error.message || 'Unknown error occurred'}
        </Typography>
        <button
          onClick={reset}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try again
        </button>
      </Paper>
    </Container>
  );
}
