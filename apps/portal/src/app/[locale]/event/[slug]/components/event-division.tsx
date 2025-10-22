'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Paper, Tabs, Tab } from '@mui/material';
import { DivisionJudgingSchedule } from './division-judging-schedule';
import { DivisionScoreboard } from './division-scoreboard';
import { DivisionTeamsList } from './division-teams-list';
import { DivisionFieldSchedule } from './divison-field-schedule';
import { DivisionAwards } from './divsion-awards';
import {
  mockScoreboardData,
  mockAwardsData,
  mockFieldScheduleData,
  mockJudgingScheduleData
} from './mock-event-data';

export interface EventDivisionProps {
  divisionId: string;
}

export const EventDivision: React.FC<EventDivisionProps> = ({ divisionId }) => {
  const t = useTranslations('pages.event');
  const { data: divisionData } = useSWR<DivisionData | null>(`/portal/divisions/${divisionId}`, {
    suspense: true,
    fallbackData: null
  });

  const [selectedTab, setSelectedTab] = useState(0); // Default to scoreboard tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
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
  );

  // {selectedTab === 0 && (
  //   <DivisionTeamsList
  //     divisionName={divisionData.currentDivision.name}
  //     teams={divisionData.teams}
  //   />
  // )}

  // {selectedTab === 1 && <DivisionScoreboard data={mockScoreboardData} eventSlug={slug} />}

  // {selectedTab === 2 && <DivisionAwards awards={mockAwardsData} eventSlug={slug} />}

  // {selectedTab === 3 && (
  //   <DivisionFieldSchedule rounds={mockFieldScheduleData} eventSlug={slug} />
  // )}

  // {selectedTab === 4 && (
  //   <DivisionJudgingSchedule sessions={mockJudgingScheduleData} eventSlug={slug} />
  // )});
};
