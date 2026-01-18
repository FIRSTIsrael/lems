'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import { Close, OpenInNew } from '@mui/icons-material';
import { JudgingCategory } from '@lems/types/judging';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { GET_UNIFIED_DIVISION, type DivisionTeam } from '../compare/graphql';
import { CompareProvider } from '../compare/compare-context';
import {
  TeamHeader,
  ScoreSummary,
  RubricScores,
  ExceedingNotes,
  Nominations,
  GpScores,
  Feedback
} from '../compare/components';

interface TeamComparisonDialogProps {
  open: boolean;
  onClose: () => void;
  teamSlugs: [string, string];
  category?: JudgingCategory;
}

export function TeamComparisonDialog({
  open,
  onClose,
  teamSlugs,
  category
}: TeamComparisonDialogProps) {
  const t = useTranslations('pages.deliberations.compare-dialog');
  const router = useRouter();
  const { currentDivision } = useEvent();

  const handleOpenFullCompare = () => {
    const teamsParam = teamSlugs.join(',');
    const categoryParam = category ? `&category=${category}` : '';
    router.push(`/lems/deliberation/compare?teams=${teamsParam}${categoryParam}`);
  };

  const { data, loading, error } = usePageData(
    GET_UNIFIED_DIVISION,
    open && teamSlugs.length === 2 ? { divisionId: currentDivision.id, teamSlugs } : undefined
  );

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{t('title')}</Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={t('open-full-compare')}>
            <IconButton onClick={handleOpenFullCompare} size="small" color="primary">
              <OpenInNew />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflow: 'auto' }}>
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh'
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{t('error-loading-teams')}</Alert>}

        {!loading && !error && data?.division?.selectedTeams && (
          <CompareProvider
            teams={data.division.selectedTeams}
            awards={data.division.judging?.awards ?? []}
            allTeams={(data.division.allTeams ?? []) as DivisionTeam[]}
            category={category}
          >
            <Grid container spacing={3}>
              {data.division.selectedTeams.map(team => (
                <Grid key={team.id} size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <TeamHeader team={team} />
                    <ScoreSummary team={team} />
                    <RubricScores team={team} />
                    <ExceedingNotes team={team} />
                    <Nominations team={team} />
                    {(!category || category === 'core-values') && <GpScores team={team} />}
                    <Feedback team={team} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CompareProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
