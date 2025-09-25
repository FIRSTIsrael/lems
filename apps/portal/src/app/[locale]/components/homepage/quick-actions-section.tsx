'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Stack,
  alpha,
  useTheme,
  IconButton
} from '@mui/material';
import { EmojiEvents as TrophyIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { quickActions } from './dummy-data';

export const QuickActionsSection = () => {
  const theme = useTheme();
  const t = useTranslations('pages.index.quick-actions');

  const actions = quickActions;

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <TrophyIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {t('title')}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {actions.map(action => {
          const IconComponent = action.icon;
          return (
            <Card
              variant="outlined"
              key={action.title}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
              onClick={() => (window.location.href = action.href)}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette[action.color].main, 0.1),
                      color: `${action.color}.main`,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <IconComponent />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {t(action.title)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(action.description)}
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <ArrowIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Paper>
  );
};
