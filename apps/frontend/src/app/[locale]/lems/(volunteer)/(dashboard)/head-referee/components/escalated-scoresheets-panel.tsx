'use client';

import { useTranslations } from 'next-intl';
import { Alert, AlertTitle, Stack, Chip, Box, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import WarningIcon from '@mui/icons-material/Warning';
import type { Scoresheet } from '../graphql/types';
import { useHeadRefereeData } from './head-referee-context';

export function EscalatedScoresheetsPanel() {
  const t = useTranslations('pages.head-referee');
  const { escalatedScoresheets } = useHeadRefereeData();

  if (escalatedScoresheets.length === 0) {
    return null;
  }

  return (
    <Alert severity="warning" icon={<WarningIcon />}>
      <AlertTitle>{t('escalated-panel.title', { count: escalatedScoresheets.length })}</AlertTitle>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {escalatedScoresheets.map(scoresheet => (
          <EscalatedScoresheetItem key={scoresheet.id} scoresheet={scoresheet} />
        ))}
      </Stack>
    </Alert>
  );
}

interface EscalatedScoresheetItemProps {
  scoresheet: Scoresheet;
}

function EscalatedScoresheetItem({ scoresheet }: EscalatedScoresheetItemProps) {
  const t = useTranslations('pages.head-referee');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1,
        bgcolor: 'background.paper',
        borderRadius: 1
      }}
    >
      <Chip label={`#${scoresheet.team.number}`} color="primary" size="small" />
      <Chip label={scoresheet.slug} size="small" variant="outlined" />
      <Chip label={t(`scoresheet-status.${scoresheet.status}`)} size="small" />
      {scoresheet.data && (
        <Chip label={`${scoresheet.data.score} ${t('points')}`} size="small" variant="outlined" />
      )}
      <Box sx={{ flex: 1 }} />
      <MuiLink
        component={Link}
        href={`/lems/team/${scoresheet.team.slug}/scoresheet/${scoresheet.slug}`}
        underline="hover"
        sx={{ fontWeight: 600 }}
      >
        {t('escalated-panel.view-scoresheet')}
      </MuiLink>
    </Box>
  );
}
