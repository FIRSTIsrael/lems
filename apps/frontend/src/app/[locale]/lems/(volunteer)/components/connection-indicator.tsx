'use client';

import { useTranslations } from 'next-intl';
import { Box, keyframes } from '@mui/material';
import {
  useConnectionState,
  type ConnectionState
} from '../../../../../lib/graphql/apollo-client-provider';

const statusConfig: {
  [key in ConnectionState]: {
    rippleColor: string;
    textColor: string;
    backgroundColor: string;
  };
} = {
  connected: {
    rippleColor: '#3cd3b2',
    textColor: '#111111',
    backgroundColor: '#f4f4f4'
  },
  disconnected: {
    rippleColor: '#f87171',
    textColor: '#000000',
    backgroundColor: '#f4f4f4'
  },
  reconnecting: {
    rippleColor: '#fbbf24',
    textColor: '#111111',
    backgroundColor: '#f4f4f4'
  },
  error: {
    rippleColor: '#ef4444',
    textColor: '#000000',
    backgroundColor: '#f4f4f4'
  }
} as const;

const rippleAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.125); }
  100% { transform: scale(1); }
`;

/**
 * Connection indicator component
 * Displays WebSocket connection status from the ConnectionStateContext
 */
export function ConnectionIndicator() {
  const t = useTranslations('components.connection-indicator');

  const { state } = useConnectionState();
  const config = statusConfig[state];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: config.textColor,
        bgcolor: config.backgroundColor,
        py: 0.5,
        px: 1.75,
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        minWidth: 100,
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Box
        sx={{
          height: '0.675rem',
          width: '0.675rem',
          borderRadius: '50%',
          backgroundColor: config.rippleColor,
          boxShadow: `0 0 0 0.25rem ${config.rippleColor}33`,
          mr: 1.25,
          animation: `${rippleAnimation} 2s linear infinite`,
          transition: 'all 0.2s ease-in-out'
        }}
      />
      <Box flex={1} textAlign="center">
        {t(state)}
      </Box>
    </Box>
  );
}
