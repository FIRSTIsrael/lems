'use client';

import { useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, Stack, useTheme } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import SearchIcon from '@mui/icons-material/Search';
import type { Team } from '../../graphql/types';
import { DISQUALIFY_TEAM } from '../../graphql/mutations/disqualify-team';
import { useEvent } from '../../../../components/event-context';
import { useJudgeAdvisor } from '../judge-advisor-context';
import { DisqualifyConfirmationDialog } from './disqualify-confirmation-dialog';
import { SearchTeamSection } from './search-team-section';
import { SelectedTeamPreview } from './selected-team-preview';
import { DisqualifiedTeamsList } from './disqualified-teams-list';

export function DisqualificationSection() {
  const t = useTranslations('pages.judge-advisor.awards.disqualification');
  const theme = useTheme();
  const { currentDivision } = useEvent();
  const { sessions, disqualifiedTeams, loading } = useJudgeAdvisor();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [disqualifyTeam] = useMutation(DISQUALIFY_TEAM);

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
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmDisqualify = useCallback(async () => {
    if (!selectedTeam) return;

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
  }, [selectedTeam, disqualifyTeam, currentDivision.id, t]);

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
        />
        <CardContent>
          <Stack spacing={2.5}>
            <SearchTeamSection
              availableTeams={availableTeams}
              selectedTeam={selectedTeam}
              onTeamSelect={setSelectedTeam}
              loading={loading}
            />

            {selectedTeam && (
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
