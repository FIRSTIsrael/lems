'use client';

import React from 'react';
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Team } from './mockTeamData';

interface TeamSidebarProps {
  team: Team;
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
}

export const TeamSidebar: React.FC<TeamSidebarProps> = ({
  team,
  selectedSeason,
  onSeasonChange
}) => {
  const t = useTranslations('pages.team');
  
  return (
    <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
      <Paper sx={{ p: 0, mb: 2 }}>
        {/* Season Selector */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <FormControl size="small" fullWidth>
            <Select 
              value={selectedSeason} 
              onChange={(e) => onSeasonChange(e.target.value)}
              displayEmpty
            >
              {team.seasons && team.seasons.length > 0 ? (
                team.seasons.map((season) => (
                  <MenuItem key={season} value={season.toString()}>
                    {t('info.season', { year: season })}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="2025">{t('info.season', { year: 2025 })}</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Navigation Menu */}
        <List sx={{ p: 0 }}>
          <ListItemButton selected>
            <ListItemText primary={t('navigation.team-info')} sx={{ color: '#1976d2' }} />
          </ListItemButton>
          <ListItemButton>
            <ListItemText primary={t('navigation.event-results')} />
          </ListItemButton>
          {/* Dynamic event list based on team's events */}
          {team.events && team.events.map((event, index) => (
            <ListItemButton key={index} sx={{ pl: 4 }}>
              <ListItemText primary={event} sx={{ fontSize: '0.875rem' }} />
            </ListItemButton>
          ))}
          <ListItemButton>
            <ListItemText primary={t('navigation.photos-videos')} />
          </ListItemButton>
          <ListItemButton>
            <ListItemText primary={t('navigation.robot-profile')} />
          </ListItemButton>
        </List>
      </Paper>
    </Box>
  );
};
