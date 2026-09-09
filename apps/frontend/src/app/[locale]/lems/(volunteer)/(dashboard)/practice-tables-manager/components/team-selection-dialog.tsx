'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Box
} from '@mui/material';
import { useTranslations } from 'next-intl';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation?: string;
}

interface TeamSelectionDialogProps {
  open: boolean;
  teams: Team[];
  onClose: () => void;
  onSelect: (team: Team) => void;
}

export function TeamSelectionDialog({ open, teams, onClose, onSelect }: TeamSelectionDialogProps) {
  const t = useTranslations('pages.practice-tables-manager.team-selection');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = teams.filter(team => {
    const query = searchQuery.toLowerCase();
    return (
      team.number.toString().includes(query) ||
      team.name.toLowerCase().includes(query) ||
      team.affiliation?.toLowerCase().includes(query)
    );
  });

  const handleSelect = (team: Team) => {
    onSelect(team);
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder={t('search-placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </Box>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredTeams.length === 0 ? (
            <ListItem>
              <ListItemText primary={t('no-teams')} />
            </ListItem>
          ) : (
            filteredTeams.map((team) => (
              <ListItemButton key={team.id} onClick={() => handleSelect(team)}>
                <ListItemText
                  primary={`#${team.number} - ${team.name}`}
                  secondary={team.affiliation}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
}
