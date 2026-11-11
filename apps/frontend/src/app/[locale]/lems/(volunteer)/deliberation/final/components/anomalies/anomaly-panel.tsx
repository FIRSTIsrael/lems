'use client';

import { useMemo } from 'react';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { Close, Warning } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { JUDGING_CATEGORIES } from '@lems/types/judging';
import { useFinalDeliberation } from '../../final-deliberation-context';
import { AnomalyCategorySection } from './anomaly-category-section';

const PANEL_WIDTH = 440;

interface AnomalyPanelProps {
  open: boolean;
  onClose: () => void;
}

export const AnomalyPanel: React.FC<AnomalyPanelProps> = ({ open, onClose }) => {
  const t = useTranslations('pages.deliberations.final.anomalies');
  const { anomalies, teams } = useFinalDeliberation();

  const teamNames = useMemo(
    () => Object.fromEntries(teams.map(team => [team.id, team.name])),
    [teams]
  );

  const anomaliesByCategory = useMemo(
    () =>
      JUDGING_CATEGORIES.map(category => ({
        category,
        anomalies: anomalies
          .filter(anomaly => anomaly.category === category)
          .sort((a, b) => b.difference - a.difference)
      })).filter(group => group.anomalies.length > 0),
    [anomalies]
  );

  if (anomalies.length === 0) return null;

  return (
    <Box
      component="aside"
      sx={{
        width: open ? PANEL_WIDTH : 0,
        flexShrink: 0,
        overflow: 'hidden',
        borderInlineStart: open ? 1 : 0,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        transition: theme =>
          theme.transitions.create('width', { duration: theme.transitions.duration.standard })
      }}
    >
      <Box
        sx={{
          width: PANEL_WIDTH,
          position: 'sticky',
          top: 0,
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Stack direction="row" spacing={1} sx={{ px: 2.5, py: 2, alignItems: 'center' }}>
          <Warning color="warning" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('count', { count: anomalies.length })}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label={t('close')}>
            <Close />
          </IconButton>
        </Stack>
        <Divider />

        <Box sx={{ p: 2.5, overflowY: 'auto' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('description')}
          </Typography>

          <Stack spacing={3}>
            {anomaliesByCategory.map(({ category, anomalies: categoryAnomalies }) => (
              <AnomalyCategorySection
                key={category}
                category={category}
                anomalies={categoryAnomalies}
                teamNames={teamNames}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
