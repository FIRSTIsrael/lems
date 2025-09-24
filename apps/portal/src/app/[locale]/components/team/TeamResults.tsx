'use client';

import React from 'react';
import { Typography, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Team } from './mockTeamData';
import { WinnerBanners } from './WinnerBanners';
import { TeamAwards } from './TeamAwards';

interface TeamResultsProps {
  team: Team;
  teamNumber: number;
}

export const TeamResults: React.FC<TeamResultsProps> = ({ team }) => {
  const t = useTranslations('pages.team');
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {t('results.title')}
      </Typography>

      {/* Winner Banners */}
      <WinnerBanners isChampion={team.isChampion || false} />

      {/* Awards Section */}
      <TeamAwards awards={team.awards} />
    </Paper>
  );
};
