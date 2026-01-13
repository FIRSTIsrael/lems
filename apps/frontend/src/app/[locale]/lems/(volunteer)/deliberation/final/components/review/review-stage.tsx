'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Paper, Typography, Grid, Button } from '@mui/material';
import { useAwardTranslations } from '@lems/localization';
import { useFinalDeliberation } from '../../final-deliberation-context';
import { AwardSection } from './award-section';
import { ApprovalModal } from './approval-modal';

export const ReviewStage: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('pages.deliberations.final.review');
  const { getName: getAwardName } = useAwardTranslations();
  const { division } = useFinalDeliberation();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Filter out personal awards and group by name
  const groupedAwards = useMemo(() => {
    const personalAwardNames = new Set(['lead-mentor', 'volunteer-of-the-year']);

    // Get all awards from the division, excluding personal awards
    const teamAwards = division.judging.awards.filter(award => !personalAwardNames.has(award.name));

    // Group by name and sort by index
    const grouped: Record<string, typeof teamAwards> = {};
    teamAwards.forEach(award => {
      if (!grouped[award.name]) {
        grouped[award.name] = [];
      }
      grouped[award.name].push(award);
    });

    // Sort each group by place
    Object.keys(grouped).forEach(name => {
      grouped[name].sort((a, b) => a.place - b.place);
    });

    return grouped;
  }, [division.judging.awards]);

  // Get award order by lowest index in each group
  const awardOrder = useMemo(() => {
    return Object.keys(groupedAwards).sort((a, b) => {
      const indexA = groupedAwards[a][0]?.index || 0;
      const indexB = groupedAwards[b][0]?.index || 0;
      return indexA - indexB;
    });
  }, [groupedAwards]);

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
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5, gap: 2.5 }}>
      {/* Title */}
      <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
        <Typography variant="h2" textAlign="center" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
          {t('title')}
        </Typography>
      </Paper>

      {/* Awards Grid */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Grid container spacing={2.5}>
          {awardOrder.map(awardName => (
            <Grid key={awardName} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
              <AwardSection
                awardName={awardName}
                awards={groupedAwards[awardName]}
                getAwardName={getAwardName}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Approval Button */}
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
        >
          {t('approve-button')}
        </Button>
      </Box>

      {/* Approval Modal */}
      <ApprovalModal
        open={openConfirmDialog}
        onClose={handleCloseConfirm}
        divisionId={division.id}
        onSuccess={handleSuccess}
      />
    </Box>
  );
};
