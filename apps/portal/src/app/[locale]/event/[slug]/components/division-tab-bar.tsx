'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Paper, Tabs, Tab, Box } from '@mui/material';
import { TeamsTab } from './tabs/teams-tab';
import { DivisionDataProvider } from './division-data-context';
import { ScoreboardTab } from './tabs/scoreboard/scoreboard-tab';
import { AwardsTab } from './tabs/awards/awards-tab';
import { FieldScheduleTab } from './tabs/field-schedule-tab';
import { JudgingScheduleTab } from './tabs/judging-schedule-tab';

interface DivisionTabBarProps {
  divisionId: string;
}

export const DivisionTabBar: React.FC<DivisionTabBarProps> = ({ divisionId }) => {
  const t = useTranslations('pages.event');
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = parseInt(searchParams.get('tab') || '0', 10);
  const [selectedTab, setSelectedTab] = useState(tabFromUrl);

  useEffect(() => {
    const urlTab = parseInt(searchParams.get('tab') || '0', 10);
    if (urlTab >= 0 && urlTab <= 4) {
      setSelectedTab(urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('tab', newTab.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <DivisionDataProvider divisionId={divisionId}>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
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
        </Tabs>
      </Paper>

      <Box width="100%">
        {selectedTab === 0 && <TeamsTab />}

        {selectedTab === 1 && <ScoreboardTab />}

        {selectedTab === 2 && <AwardsTab />}

        {selectedTab === 3 && <FieldScheduleTab />}

        {selectedTab === 4 && <JudgingScheduleTab />}
      </Box>
    </DivisionDataProvider>
  );
};
