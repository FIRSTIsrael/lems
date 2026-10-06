'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  loading?: boolean;
  empty?: boolean;
  height?: number | 'auto';
  /** Charts are always rendered LTR so axes stay readable in RTL locales. */
  ltr?: boolean;
  children?: ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  action,
  loading,
  empty,
  height = 320,
  ltr = true,
  children
}) => {
  const t = useTranslations('pages.insights');

  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem', flex: 1 }}>
          {title}
        </Typography>
        {action}
        {description && (
          <Tooltip title={description}>
            <InfoOutlined fontSize="small" color="action" />
          </Tooltip>
        )}
      </Stack>
      {loading ? (
        <Skeleton variant="rounded" height={height === 'auto' ? 320 : height} />
      ) : empty ? (
        <Box
          sx={{
            height: height === 'auto' ? 200 : height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography color="text.secondary">{t('no-data')}</Typography>
        </Box>
      ) : (
        <Box sx={{ height, direction: ltr ? 'ltr' : undefined }}>{children}</Box>
      )}
    </Paper>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, loading }) => (
  <Paper
    sx={{
      p: 2.5,
      height: '100%',
      borderTop: theme => `4px solid ${color ?? theme.palette.primary.main}`
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
      {title}
    </Typography>
    {loading ? (
      <Skeleton width="60%" height={48} />
    ) : (
      <Typography sx={{ fontWeight: 800, fontSize: '2rem', lineHeight: 1.3 }}>{value}</Typography>
    )}
    {subtitle && !loading && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Paper>
);
