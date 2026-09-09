'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Typography,
  Stack,
  Skeleton
} from '@mui/material';
import { useTranslations } from 'next-intl';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation?: string;
  logoUrl?: string;
}

interface TeamSearchBarProps {
  teams: Team[];
  selectedCell: { tableIndex: number; time: string } | null;
  onAssign: (team: Team) => void;
}

export function TeamSearchBar({ teams, selectedCell, onAssign }: TeamSearchBarProps) {
  const t = useTranslations('pages.practice-tables-manager.search');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = teams.filter(team => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return (
      team.number.toString().includes(query) ||
      team.name.toLowerCase().includes(query) ||
      team.affiliation?.toLowerCase().includes(query)
    );
  });

  const showSkeleton = !searchQuery;

  return (
    <Paper
      sx={{
        p: 2,
        position: 'sticky',
        top: 16,
        height: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Box>
          <TextField
            fullWidth
            placeholder={t('placeholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="small"
          />
          {selectedCell && (
            <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
              {t('selected-slot', {
                table: selectedCell.tableIndex + 1,
                time: selectedCell.time
              })}
            </Typography>
          )}
        </Box>

        {/* Scrollable container for team list */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {showSkeleton ? (
            // Show skeleton when not searching
            <Stack spacing={1}>
              {[...Array(8)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                  <Skeleton variant="rectangular" width={80} height={32} />
                </Box>
              ))}
            </Stack>
          ) : filteredTeams.length > 0 ? (
            <List dense sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
              {filteredTeams.map(team => (
                <ListItem
                  key={team.id}
                  secondaryAction={
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!selectedCell}
                      onClick={() => {
                        onAssign(team);
                        setSearchQuery('');
                      }}
                    >
                      {t('assign')}
                    </Button>
                  }
                >
                  {team.logoUrl && (
                    <ListItemAvatar>
                      <Avatar src={team.logoUrl} alt={team.name} />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={`#${team.number} - ${team.name}`}
                    secondary={team.affiliation}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t('no-results')}
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
