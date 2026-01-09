'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import { CompareProvider } from '../../compare/compare-context';
import { CompareTeam } from '../../compare/components';
import { GET_UNIFIED_DIVISION } from '../../compare/graphql';
import type {
  Team,
  Award,
  UnifiedDivisionData,
  UnifiedDivisionVars
} from '../../compare/graphql/types';
import type { EnrichedTeam } from '../types';

interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  team1?: EnrichedTeam | null;
  team2?: EnrichedTeam | null;
  divisionId: string;
  awards?: Award[];
  allTeams?: Team[];
}

export const CompareModal: React.FC<CompareModalProps> = ({
  open,
  onClose,
  team1,
  team2,
  divisionId,
  awards = [],
  allTeams = []
}) => {
  const t = useTranslations('pages.deliberations.category.compare-modal');

  // Extract team slugs from the EnrichedTeam objects
  const teamSlugs = useMemo(() => {
    const slugs: string[] = [];
    if (team1?.slug) slugs.push(team1.slug);
    if (team2?.slug) slugs.push(team2.slug);
    return slugs;
  }, [team1, team2]);

  // Fetch the full team data from the compare query
  const { data, loading, error } = useQuery<UnifiedDivisionData, UnifiedDivisionVars>(
    GET_UNIFIED_DIVISION,
    {
      variables: {
        divisionId,
        teamSlugs: teamSlugs.length > 0 ? teamSlugs : undefined
      },
      skip: !open || teamSlugs.length === 0
    }
  );

  const teamsToCompare = useMemo(() => {
    return data?.division?.selectedTeams ?? [];
  }, [data?.division?.selectedTeams]);

  const divisionAwards = useMemo(() => {
    return data?.division?.awards ?? awards;
  }, [data?.division?.awards, awards]);

  const divisionAllTeams = useMemo(() => {
    return data?.division?.allTeams ?? allTeams;
  }, [data?.division?.allTeams, allTeams]);

  if (teamSlugs.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {t('title')}
        <IconButton
          onClick={onClose}
          sx={{
            color: 'inherit'
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          overflowY: 'auto'
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px'
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{t('error-loading-teams')}</Alert>
        ) : teamsToCompare.length === 0 ? (
          <Alert severity="warning">{t('teams-not-found')}</Alert>
        ) : (
          <CompareProvider
            teams={teamsToCompare}
            awards={divisionAwards}
            allTeams={divisionAllTeams as unknown as Team[]}
          >
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {teamsToCompare.map((team: Team) => (
                  <Grid key={team.id} size={{ xs: 12, sm: 6 }}>
                    <CompareTeam team={team} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </CompareProvider>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
