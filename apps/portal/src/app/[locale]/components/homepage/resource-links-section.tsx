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
import { Language as WebsiteIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { resourceLinks } from './dummy-data';

export const ResourceLinksSection = () => {
  const theme = useTheme();
  const t = useTranslations('pages.index.resources');

  const resources = resourceLinks;

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <WebsiteIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {t('title')}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {resources.map(resource => {
          const IconComponent = resource.icon;
          return (
            <Card
              variant="outlined"
              key={resource.title}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
              onClick={() => {
                if (resource.external) {
                  window.open(resource.href, '_blank', 'noopener,noreferrer');
                } else {
                  window.location.href = resource.href;
                }
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette[resource.color].main, 0.1),
                      color: `${resource.color}.main`,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <IconComponent />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {t(resource.title)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(resource.description)}
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
