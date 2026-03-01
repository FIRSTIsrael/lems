'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
  Box,
  InputAdornment,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslations } from 'next-intl';
import { TeamWithDivision } from '@lems/types/api/admin';
import { EditTeamsPreviewModal } from './edit-teams-preview-modal';

interface EditTeamsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTeam: TeamWithDivision;
  eventId: string;
  divisions: TeamWithDivision[] | never[];
}

export const EditTeamsDialog = ({ open, onClose, selectedTeam, eventId }: EditTeamsDialogProps) => {
  const t = useTranslations('pages.events.teams.edit-teams-dialog');
  const [searchQuery, setSearchQuery] = useState('');
  const [secondaryTeam, setSecondaryTeam] = useState<TeamWithDivision | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: teams = [], isLoading: teamsLoading } = useSWR<TeamWithDivision[]>(
    open ? `/admin/events/${eventId}/teams` : null
  );

  const otherTeams = useMemo(() => {
    return teams.filter(team => team.id !== selectedTeam.id);
  }, [teams, selectedTeam.id]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return otherTeams;

    const query = searchQuery.toLowerCase();
    return otherTeams.filter(
      team =>
        team.number.toString().includes(query) ||
        team.name.toLowerCase().includes(query) ||
        team.affiliation.toLowerCase().includes(query)
    );
  }, [otherTeams, searchQuery]);

  const handleTeamSelect = (team: TeamWithDivision) => {
    setSecondaryTeam(team);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setSecondaryTeam(null);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSecondaryTeam(null);
    setPreviewOpen(false);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedTeam && (
              <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('first-team-selected')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={`#${selectedTeam.number} - ${selectedTeam.name}`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </Box>
            )}

            <TextField
              autoFocus
              placeholder={t('search-placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            {teamsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={40} />
              </Box>
            ) : filteredTeams.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('no-teams')}</Typography>
              </Box>
            ) : (
              <List disablePadding sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {filteredTeams.map((team, index) => {
                  const isFromOtherDivision = team.division.id !== selectedTeam.division.id;

                  return (
                    <ListItemButton
                      key={team.id}
                      onClick={() => handleTeamSelect(team)}
                      divider={index < filteredTeams.length - 1}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <span>{`#${team.number} - ${team.name}`}</span>
                            {isFromOtherDivision && (
                              <Chip
                                label={team.division.name}
                                size="small"
                                sx={{
                                  backgroundColor: team.division.color,
                                  color: '#fff'
                                }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={team.affiliation}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('actions.cancel')}</Button>
        </DialogActions>
      </Dialog>

      {secondaryTeam && (
        <EditTeamsPreviewModal
          open={previewOpen}
          onClose={handlePreviewClose}
          selectedTeam={selectedTeam}
          secondaryTeam={secondaryTeam}
          eventId={eventId}
        />
      )}
    </>
  );
};
