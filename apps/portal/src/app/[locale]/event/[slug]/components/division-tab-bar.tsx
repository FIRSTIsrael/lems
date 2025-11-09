'use client';

import { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Tabs, Tab, Box } from '@mui/material';
import { TeamsTab } from './tabs/teams-tab';
import { DivisionProvider } from './division-data-context';
import { ScoreboardTab } from './tabs/scoreboard/scoreboard-tab';
import { AwardsTab } from './tabs/awards/awards-tab';
import { FieldScheduleTab } from './tabs/field-schedule-tab';
import { JudgingScheduleTab } from './tabs/judging-schedule-tab';
import { LoadingTab } from './tabs/loading-tab';

interface DivisionTabBarProps {
  divisionId: string;
}

export const DivisionTabBar: React.FC<DivisionTabBarProps> = ({ divisionId }) => {
  const t = useTranslations('pages.event');
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <DivisionProvider divisionId={divisionId}>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('teams')} />
          <Tab label={t('quick-links.scoreboard')} />
          <Tab label={t('quick-links.awards')} />
          <Tab label={t('quick-links.field-schedule')} />
          <Tab label={t('quick-links.judging-schedule')} />
        </Tabs>
      </Paper>

      <Box width="100%">
        <Suspense fallback={<LoadingTab />}>
          {selectedTab === 0 && <TeamsTab />}

          {selectedTab === 1 && <ScoreboardTab />}

          {selectedTab === 2 && <AwardsTab />}

          {selectedTab === 3 && <FieldScheduleTab />}

          {selectedTab === 4 && <JudgingScheduleTab />}
        </Suspense>
      </Box>
    </DivisionProvider>
  );
};
