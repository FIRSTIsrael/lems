'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Tabs, Tab, Box } from '@mui/material';
import type { TournamentManagerData } from '../graphql';
import { MatchSwapForm } from './match-swap-form';
import { JudgingSwapForm } from './judging-swap-form';

interface SwapPanelProps {
  division: TournamentManagerData['division'];
  onSwapComplete: () => Promise<void>;
}

export function SwapPanel({ division, onSwapComplete }: SwapPanelProps) {
  const t = useTranslations('pages.tournament-manager');
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('match-swaps')} />
        <Tab label={t('judging-swaps')} />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {activeTab === 0 && <MatchSwapForm division={division} onSwapComplete={onSwapComplete} />}
        {activeTab === 1 && <JudgingSwapForm division={division} onSwapComplete={onSwapComplete} />}
      </Box>
    </Paper>
  );
}
