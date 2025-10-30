'use client';

/**
 * Connection Status Indicator
 * Displays the real-time connection status to the WebSocket server
 */

import { Chip } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import ErrorIcon from '@mui/icons-material/Error';
import { useGraphQLWSClient } from './graphql-ws-provider';

export function ConnectionStatusIndicator() {
  const { connectionStatus } = useGraphQLWSClient();

  const statusConfig = {
    connecting: {
      label: 'Connecting...',
      color: 'default' as const,
      icon: <SyncIcon />
    },
    connected: {
      label: 'Connected',
      color: 'success' as const,
      icon: <WifiIcon />
    },
    disconnected: {
      label: 'Disconnected',
      color: 'default' as const,
      icon: <WifiOffIcon />
    },
    reconnecting: {
      label: 'Reconnecting...',
      color: 'warning' as const,
      icon: <SyncIcon className="animate-spin" />
    },
    error: {
      label: 'Connection Error',
      color: 'error' as const,
      icon: <ErrorIcon />
    }
  };

  const config = statusConfig[connectionStatus];

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      variant={connectionStatus === 'connected' ? 'filled' : 'outlined'}
    />
  );
}
