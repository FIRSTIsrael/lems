'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Paper, Typography, Grid, Button } from '@mui/material';
import { useFinalDeliberation } from '../../final-deliberation-context';
import { EnrichedTeam } from '../../types';
import { AwardSection } from './award-section';
import { ApprovalModal } from './approval-modal';

export const ReviewStage: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('pages.deliberations.final.review');
  const { awards, deliberation, division, teams } = useFinalDeliberation();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Filter out personal awards and group by name
  const mappedWinners = useMemo(() => {
    const mapped: Record<string, EnrichedTeam[]> = {};
    for (const [awardName, placeToTeamId] of Object.entries(awards)) {
      // Extract team IDs from place → teamId mapping (all awards now use same format)
      const teamIds = Object.values(placeToTeamId as Record<number, string>);
      const winners = [];
      for (const teamId of teamIds) {
        const team = teams.find(t => t.id === teamId);
        if (team) {
          winners.push(team);
        }
      }
      mapped[awardName] = winners;
    }
    return mapped;
  }, [awards, teams]);

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

      <Box sx={{ flex: 1 }}>
        <Grid container spacing={2.5}>
          {Object.entries(mappedWinners).map(([awardName, winners]) => (
            <Grid key={awardName} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
              <AwardSection awardName={awardName} winners={winners} />
            </Grid>
          ))}
        </Grid>
      </Box>

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
          disabled={deliberation.status === 'completed'}
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
