'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Paper, Tabs, Tab, Box } from '@mui/material';
import { TeamsTab } from './tabs/teams-tab';
import { DivisionProvider } from './division-data-context';
import { ScoreboardTab } from './tabs/scoreboard/scoreboard-tab';
import { AwardsTab } from './tabs/awards/awards-tab';
import { FieldScheduleTab } from './tabs/field-schedule-tab';
import { JudgingScheduleTab } from './tabs/judging-schedule-tab';
import { AgendaTab } from './tabs/agenda-tab';
import { LoadingTab } from './tabs/loading-tab';

interface DivisionTabBarProps {
  divisionId: string;
}

export const DivisionTabBar: React.FC<DivisionTabBarProps> = ({ divisionId }) => {
  const t = useTranslations('pages.event');
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = parseInt(searchParams.get('tab') || '0', 10);

  const handleTabChange = (newTab: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('tab', newTab.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <DivisionProvider divisionId={divisionId}>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => handleTabChange(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('teams')} />
          <Tab label={t('quick-links.scoreboard')} />
          <Tab label={t('quick-links.awards')} />
          <Tab label={t('quick-links.field-schedule')} />
          <Tab label={t('quick-links.judging-schedule')} />
          <Tab label={t('quick-links.agenda')} />
        </Tabs>
      </Paper>

      <Box width="100%">
        {activeTab === 0 && (
          <Suspense fallback={<LoadingTab />}>
            <TeamsTab />
          </Suspense>
        )}

        {activeTab === 1 && (
          <Suspense fallback={<LoadingTab />}>
            <ScoreboardTab />
          </Suspense>
        )}

        {activeTab === 2 && (
          <Suspense fallback={<LoadingTab />}>
            <AwardsTab />
          </Suspense>
        )}

        {activeTab === 3 && (
          <Suspense fallback={<LoadingTab />}>
            <FieldScheduleTab />
          </Suspense>
        )}

        {activeTab === 4 && (
          <Suspense fallback={<LoadingTab />}>
            <JudgingScheduleTab />
          </Suspense>
        )}

        {activeTab === 5 && (
          <Suspense fallback={<LoadingTab />}>
            <AgendaTab />
          </Suspense>
        )}
      </Box>
    </DivisionProvider>
  );
};
