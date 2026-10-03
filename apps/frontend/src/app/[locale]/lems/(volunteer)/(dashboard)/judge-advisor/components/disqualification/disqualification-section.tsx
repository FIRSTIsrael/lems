'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Stack,
  useTheme,
  Button,
  Tooltip
} from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { Team } from '../../graphql/types';
import { DISQUALIFY_TEAM } from '../../graphql/mutations/disqualify-team';
import { useEvent } from '../../../../components/event-context';
import { useJudgeAdvisor } from '../judge-advisor-context';
import { useFilters } from '../filters-context';
import { DisqualifyConfirmationDialog } from './disqualify-confirmation-dialog';
import { SearchTeamSection } from './search-team-section';
import { SelectedTeamPreview } from './selected-team-preview';
import { DisqualifiedTeamsList } from './disqualified-teams-list';

export function DisqualificationSection() {
  const t = useTranslations('pages.judge-advisor.awards.disqualification');
  const tGrid = useTranslations('pages.judge-advisor.grid');
  const theme = useTheme();
  const { currentDivision } = useEvent();
  const { sessions, disqualifiedTeams, deliberations, finalDeliberation, loading } =
    useJudgeAdvisor();
  const { showBlocked, setShowBlocked } = useFilters();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [disqualifyTeam] = useMutation(DISQUALIFY_TEAM);

  const anyDeliberationStarted = useMemo(() => {
    return Object.values(deliberations).some(
      deliberation => deliberation && deliberation.status !== 'not-started'
    );
  }, [deliberations, finalDeliberation]);

  useEffect(() => {
    if (!anyDeliberationStarted) return;
    setSelectedTeam(null);
    setConfirmDialogOpen(false);
  }, [anyDeliberationStarted]);

  const allTeams = useMemo(() => {
    return sessions.map(session => session.team);
  }, [sessions]);

  const availableTeams = useMemo(() => {
    return allTeams.filter(team => !disqualifiedTeams.has(team.id));
  }, [allTeams, disqualifiedTeams]);

  const disqualifiedTeamsData = useMemo(() => {
    return allTeams.filter(team => disqualifiedTeams.has(team.id));
  }, [allTeams, disqualifiedTeams]);

  const handleDisqualifyClick = useCallback(() => {
    if (anyDeliberationStarted) return;
    setConfirmDialogOpen(true);
  }, [anyDeliberationStarted]);

  const handleConfirmDisqualify = useCallback(async () => {
    if (!selectedTeam || anyDeliberationStarted) return;

    try {
      await disqualifyTeam({
        variables: {
          teamId: selectedTeam.id,
          divisionId: currentDivision.id
        }
      });
      setSelectedTeam(null);
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error disqualifying team:', error);
      toast.error(t('error-disqualifying-team'));
    }
  }, [selectedTeam, anyDeliberationStarted, disqualifyTeam, currentDivision.id, t]);

  const handleCancelDisqualify = useCallback(() => {
    setConfirmDialogOpen(false);
  }, []);

  return (
    <Stack spacing={3}>
      {/* Search and Preview Card */}
      <Card sx={{ boxShadow: theme.shadows[2] }}>
        <CardHeader
          title={t('search-title')}
          avatar={<SearchIcon sx={{ color: 'primary.main' }} />}
          slotProps={{ title: { variant: 'h6', sx: { fontWeight: 600 } } }}
          action={
            <Tooltip
              title={showBlocked ? tGrid('filter.hide-blocked') : tGrid('filter.show-blocked')}
            >
              <Button
                size="small"
                variant={showBlocked ? 'contained' : 'outlined'}
                onClick={() => setShowBlocked(!showBlocked)}
                startIcon={showBlocked ? <VisibilityIcon /> : <VisibilityOffIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {showBlocked ? tGrid('filter.hide-blocked') : tGrid('filter.show-blocked')}
              </Button>
            </Tooltip>
          }
        />
        <CardContent>
          <Stack spacing={2.5}>
            {anyDeliberationStarted && (
              <Alert severity="info" icon={<InfoOutlinedIcon />}>
                {t('blocked-after-deliberation')}
              </Alert>
            )}

            <SearchTeamSection
              availableTeams={availableTeams}
              selectedTeam={selectedTeam}
              onTeamSelect={setSelectedTeam}
              loading={loading}
              disabled={anyDeliberationStarted}
            />

            {selectedTeam && !anyDeliberationStarted && (
              <SelectedTeamPreview
                selectedTeam={selectedTeam}
                loading={loading}
                onDisqualifyClick={handleDisqualifyClick}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      <DisqualifiedTeamsList disqualifiedTeams={disqualifiedTeamsData} />

      <DisqualifyConfirmationDialog
        open={confirmDialogOpen}
        team={selectedTeam}
        loading={loading}
        onConfirm={handleConfirmDisqualify}
        onCancel={handleCancelDisqualify}
      />
    </Stack>
  );
}
