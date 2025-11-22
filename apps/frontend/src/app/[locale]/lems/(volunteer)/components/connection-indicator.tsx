'use client';

import { useTranslations } from 'next-intl';
import { Box, keyframes, CSSProperties, Typography } from '@mui/material';
import {
  useConnectionState,
  type ConnectionState
} from '../../../../../lib/graphql/apollo-client-provider';

const statusConfig: {
  [key in ConnectionState]: CSSProperties['color'];
} = {
  connected: '#3cd3b2',
  disconnected: '#f87171',
  reconnecting: '#fbbf24',
  idle: '#24befb',
  error: '#ef4444'
} as const;

const rippleAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.125); }
  100% { transform: scale(1); }
`;

interface ConnectionIndicatorProps {
  compact?: boolean;
}

export function ConnectionIndicator({ compact = false }: ConnectionIndicatorProps) {
  const t = useTranslations('components.connection-indicator');

  const { state } = useConnectionState();
  const statusColor = statusConfig[state];

  if (compact) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.5rem',
          p: 1.5,
          flexShrink: 0,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1) inset'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '0.675rem',
            width: '0.675rem',
            borderRadius: '50%',
            backgroundColor: statusColor,
            boxShadow: `0 0 0 0.25rem ${statusColor}33`,
            animation: `${rippleAnimation} 2s linear infinite`,
            transition: 'all 0.2s ease-in-out'
          }}
          title={t(state)}
        />
      </Box>
    );
  }

  // Desktop: icon + text
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        bgcolor: 'rgba(255, 255, 255, 0.18)',
        boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
        py: 0.5,
        px: 1.75,
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        minWidth: 100,
        maxWidth: 150,
        width: 'fit-content',
        transition: 'all 0.2s ease-in-out',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        // 🚀 Glass-like Hover Effect Added Below 🚀
        '&:hover': {
          cursor: 'default',
          bgcolor: 'rgba(255, 255, 255, 0.3)', // Increase background opacity for 'frosting'
          boxShadow:
            'inset 0 1px 5px rgba(255, 255, 255, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.1)', // Brighter inner glow
          border: '1px solid rgba(255, 255, 255, 0.35)', // Brighter border
          transform: 'scale(1.03)' // Subtle lift on hover
        }
      }}
    >
      <Box
        sx={{
          height: '0.675rem',
          width: '0.675rem',
          borderRadius: '50%',
          backgroundColor: statusColor,
          boxShadow: `0 0 0 0.25rem ${statusColor}33`,
          mr: 1.25,
          animation: `${rippleAnimation} 2s linear infinite`,
          transition: 'all 0.2s ease-in-out',
          flexShrink: 0
        }}
      />
      <Typography
        flex={1}
        textAlign="center"
        variant="body2"
        component="span"
        sx={{ userSelect: 'none' }}
      >
        {t(state)}
      </Typography>
    </Box>
  );
}
