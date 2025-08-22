'use client';

import useSWR, { mutate } from 'swr';
import { useTranslations } from 'next-intl';
import { Dialog, DialogTitle, Box, CircularProgress } from '@mui/material';
import { Team, Division, TeamWithDivision, Event } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../../lib/fetch';
import { RegisterTeamsDialogContent } from './register-teams-dialog-content';

interface RegisterTeamsDialogProps {
  open: boolean;
  onClose: () => void;
  event: Event;
}

export const RegisterTeamsDialog = ({ open, onClose, event }: RegisterTeamsDialogProps) => {
  const t = useTranslations('pages.events.teams.registration-dialog');

  const { data: divisions = [], isLoading: divisionsLoading } = useSWR<Division[]>(
    `/admin/events/${event.slug}/divisions`
  );

  const { data: teams = [], isLoading: teamsLoading } = useSWR<Team[]>(
    `/admin/events/${event.slug}/teams/available`
  );

  const isLoading = divisionsLoading || teamsLoading;

  const handleSubmit = async (teams: TeamWithDivision[]) => {
    const body = teams.reduce(
      (acc, team) => {
        const { division, id } = team;
        if (!acc[division.id]) {
          acc[division.id] = [];
        }
        acc[division.id].push(id);
        return acc;
      },
      {} as Record<string, string[]>
    );

    await apiFetch(`/admin/events/${event.slug}/teams/register`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });

    mutate(`/admin/events/${event.slug}/teams`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { height: '80vh', maxHeight: '800px' } } }}
    >
      <DialogTitle>{t('title', { divisions: divisions.length })}</DialogTitle>

      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          minHeight="400px"
        >
          <CircularProgress size={60} />
        </Box>
      ) : (
        <RegisterTeamsDialogContent
          teams={teams}
          divisions={divisions}
          onClose={onClose}
          handleSubmit={handleSubmit}
        />
      )}
    </Dialog>
  );
};
