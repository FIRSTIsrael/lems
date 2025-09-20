'use client';

import { Box, Alert, Collapse } from '@mui/material';

interface NotificationBannerProps {
  variant: 'success' | 'error' | null;
  message: string;
  show: boolean;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  variant,
  message,
  show
}) => {
  return (
    <Collapse in={show} sx={{ mt: 2 }}>
      {variant && (
        <Box>
          <Alert severity={variant} sx={{ mb: 1 }}>
            {message}
          </Alert>
        </Box>
      )}
    </Collapse>
  );
};
