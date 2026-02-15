'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Paper, Typography, Grid, Button, CircularProgress } from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { useFinalDeliberation } from '../../final-deliberation-context';
import { EnrichedTeam } from '../../types';
import { GET_DIVISION_AWARDS } from '../../graphql';
import { AwardSection } from './award-section';
import { ApprovalModal } from './approval-modal';

export const ReviewStage: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('pages.deliberations.final.review');
  const { deliberation, division, teams } = useFinalDeliberation();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const { data: awardsData, loading: awardsLoading } = useQuery(GET_DIVISION_AWARDS, {
    variables: { divisionId: division.id }
  });

  const mappedWinners = useMemo(() => {
    const mapped: Record<string, EnrichedTeam[]> = {};

    if (!awardsData?.division?.judging?.awards) {
      return mapped;
    }

    // Group awards by name, filtering for TEAM awards with winners only
    for (const award of awardsData.division.judging.awards) {
      if (award.type !== 'TEAM' || !award.winner) {
        continue;
      }

      if (!mapped[award.name]) {
        mapped[award.name] = [];
      }

      if ('team' in award.winner) {
        const teamWinner = award.winner;
        if (teamWinner.team) {
          const team = teams.find(t => t.id === teamWinner.team.id);
          if (team) {
            mapped[award.name].push(team);
          }
        }
      }
    }

    return mapped;
  }, [awardsData, teams]);

  const handleOpenConfirm = useCallback(() => {
    setOpenConfirmDialog(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirmDialog(false);
  }, []);

  const handleSuccess = useCallback(() => {
    router.push('/lems');
  }, [router]);

  return (
    <Box
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5, gap: 2.5, overflow: 'auto' }}
    >
      <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
        <Typography variant="h2" textAlign="center" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
          {t('title')}
        </Typography>
      </Paper>

      {awardsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flex: 1 }}>
          <Grid container spacing={2.5}>
            {Object.entries(mappedWinners).map(([awardName, winners]) => (
              <Grid key={awardName} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
                <AwardSection awardName={awardName} winners={winners} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2.5 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleOpenConfirm}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none'
          }}
          disabled={deliberation.status === 'completed' || awardsLoading}
        >
          {t('approve-button')}
        </Button>
      </Box>

      <ApprovalModal
        open={openConfirmDialog}
        onClose={handleCloseConfirm}
        divisionId={division.id}
        onSuccess={handleSuccess}
      />
    </Box>
  );
};
