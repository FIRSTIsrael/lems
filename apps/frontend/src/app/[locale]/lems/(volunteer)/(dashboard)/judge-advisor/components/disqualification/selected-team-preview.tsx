'use client';

import { Button, Paper, useTheme, alpha } from '@mui/material';
import { useTranslations } from 'next-intl';
import BlockIcon from '@mui/icons-material/Block';
import type { Team } from '../../graphql/types';
import { TeamInfo } from '../../../components/team-info';

interface SelectedTeamPreviewProps {
  selectedTeam: Team | null;
  loading: boolean;
  onDisqualifyClick: () => void;
}

export function SelectedTeamPreview({
  selectedTeam,
  loading,
  onDisqualifyClick
}: SelectedTeamPreviewProps) {
  const t = useTranslations('pages.judge-advisor.awards.disqualification');
  const theme = useTheme();

  if (!selectedTeam) return null;

  return (
    <Paper
      sx={{
        p: 2.5,
        backgroundColor: alpha(theme.palette.warning.main, 0.08),
        borderLeft: `4px solid ${theme.palette.warning.main}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: theme.transitions.create(['all']),
        boxShadow: theme.shadows[1],
        gap: 2
      }}
    >
      <TeamInfo team={selectedTeam} size="md" />

      <Button
        size="small"
        color="error"
        variant="contained"
        onClick={onDisqualifyClick}
        disabled={loading}
        startIcon={<BlockIcon />}
        sx={{
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.95rem',
          transition: theme.transitions.create(['all']),
          flexShrink: 0,
          '&:not(:disabled):hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        {t('disqualify')}
      </Button>
    </Paper>
  );
}
