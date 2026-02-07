'use client';

import { useState } from 'react';
import { Alert, Box, Popover, Stack, Typography, useTheme, alpha } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Anomaly } from '../final-deliberation-computation';

const CATEGORY_COLORS: Record<string, string> = {
  'core-values': '#d32f2f',
  'innovation-project': '#1976d2',
  'robot-design': '#388e3c'
};

const CATEGORY_BG_COLORS: Record<string, string> = {
  'core-values': '#ffebee',
  'innovation-project': '#e3f2fd',
  'robot-design': '#e8f5e8'
};

interface AnomalyAlertProps {
  anomalies: Anomaly[];
}

export const AnomalyAlert: React.FC<AnomalyAlertProps> = ({ anomalies }) => {
  const t = useTranslations('pages.deliberations.final.anomalies');
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!anomalies || anomalies.length === 0) {
    return null;
  }

  const handleAlertClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'anomaly-popover' : undefined;

  const getAnomalyMessage = (anomaly: Anomaly): string => {
    const categoryKey = anomaly.category as 'core-values' | 'innovation-project' | 'robot-design';
    const categoryLabel = t(categoryKey);
    const messageKey = anomaly.isHigher ? 'higher' : 'lower';

    return t(messageKey, {
      teamNumber: anomaly.teamNumber,
      difference: anomaly.difference,
      category: categoryLabel
    });
  };

  return (
    <>
      <Alert
        severity="warning"
        icon={<Warning />}
        onClick={handleAlertClick}
        sx={{
          cursor: 'pointer',
          mb: 2,
          '&:hover': {
            backgroundColor: alpha(theme.palette.warning.main, 0.15)
          }
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('alert-title')}
          </Typography>
          <Typography variant="body2">{t('alert-description')}</Typography>
        </Box>
      </Alert>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Box
          sx={{
            p: 2,
            maxWidth: '500px',
            maxHeight: '400px',
            overflow: 'auto'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {t('alert-title')}
          </Typography>

          <Stack spacing={1.5}>
            {anomalies.map((anomaly, index) => {
              const categoryColor = CATEGORY_COLORS[anomaly.category];
              const categoryBgColor = CATEGORY_BG_COLORS[anomaly.category];

              return (
                <Box
                  key={`${anomaly.teamId}-${anomaly.category}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.5,
                    backgroundColor: categoryBgColor,
                    borderLeft: `4px solid ${categoryColor}`,
                    borderRadius: 1
                  }}
                >
                  <Box
                    sx={{
                      mt: 0.25,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: categoryColor,
                      flexShrink: 0
                    }}
                  />
                  <Typography variant="body2" sx={{ flex: 1, color: 'text.primary' }}>
                    {getAnomalyMessage(anomaly)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};
