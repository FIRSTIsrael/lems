'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, Stack, Chip, Box, Typography } from '@mui/material';
import Link from 'next/link';
import WarningIcon from '@mui/icons-material/Warning';
import { useMatchTranslations } from '@lems/localization';
import type { Scoresheet } from '../graphql/types';
import { useHeadRefereeData } from './head-referee-context';

export function EscalatedScoresheetsPanel() {
  const t = useTranslations('pages.head-referee');
  const { escalatedScoresheets } = useHeadRefereeData();

  if (escalatedScoresheets.length === 0) {
    return null;
  }

  return (
    <Card
      elevation={2}
      sx={{
        borderLeft: '4px solid',
        borderColor: 'warning.main'
      }}
    >
      <CardHeader
        avatar={<WarningIcon sx={{ color: 'warning.main' }} />}
        title={
          <Typography variant="h6" fontWeight={600}>
            {t('escalated-panel.title', { count: escalatedScoresheets.length })}
          </Typography>
        }
        sx={{
          backgroundColor: 'warning.lighter',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiCardHeader-avatar': {
            mr: 1.5
          }
        }}
      />
      <CardContent sx={{ pt: 2 }}>
        <Stack spacing={1.5}>
          {escalatedScoresheets.map(scoresheet => (
            <EscalatedScoresheetItem key={scoresheet.id} scoresheet={scoresheet} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

interface EscalatedScoresheetItemProps {
  scoresheet: Scoresheet;
}

function EscalatedScoresheetItem({ scoresheet }: EscalatedScoresheetItemProps) {
  const t = useTranslations('pages.head-referee');
  const { getStage } = useMatchTranslations();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 1.5,
        backgroundColor: 'background.paper',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderColor: 'action.hover'
        }
      }}
      component={Link}
      href={`/lems/team/${scoresheet.team.slug}/scoresheet/${scoresheet.slug}`}
      style={{ textDecoration: 'none' }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
        <Chip
          label={`#${scoresheet.team.number}`}
          color="primary"
          size="small"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={t('scoresheet-round', {
            stage: getStage(scoresheet.stage),
            round: scoresheet.round
          })}
          size="small"
        />
        <Chip label={t(`scoresheet-status.${scoresheet.status}`)} size="small" />
        {scoresheet.data && (
          <Chip label={`${scoresheet.data.score} ${t('points')}`} size="small" variant="outlined" />
        )}
      </Box>
    </Box>
  );
}
