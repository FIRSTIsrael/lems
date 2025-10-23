'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Tabs, Tab } from '@mui/material';
import { DivisionData } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import { DivisionJudgingSchedule } from './division-judging-schedule';
import { DivisionScoreboard } from './division-scoreboard';
import { DivisionTeamsList } from './division-teams-list';
import { DivisionFieldSchedule } from './divison-field-schedule';
import { DivisionAwards } from './divsion-awards';
import { DivisionTeamsProvider } from './division-teams-context';

export interface EventDivisionProps {
  divisionId: string;
}

export const EventDivision: React.FC<EventDivisionProps> = ({ divisionId }) => {
  const t = useTranslations('pages.event');
  const [selectedTab, setSelectedTab] = useState(0); // Default to scoreboard tab
  const { data: divisionData } = useRealtimeData<DivisionData | null>(
    `/portal/divisions/${divisionId}`,
    undefined,
    {
      suspense: true,
      fallbackData: null
    }
  );

  if (!divisionData) {
    return null;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <DivisionTeamsProvider value={divisionData.teams}>
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

      {selectedTab === 0 && <DivisionTeamsList divisionName={divisionData.name} />}

      {selectedTab === 1 && <DivisionScoreboard data={divisionData.scoreboard} />}

      {selectedTab === 2 && <DivisionAwards awards={divisionData.awards} />}

      {selectedTab === 3 && (
        <DivisionFieldSchedule schedule={divisionData.fieldSchedule} tables={divisionData.tables} />
      )}

      {selectedTab === 4 && (
        <DivisionJudgingSchedule
          sessions={divisionData.judgingSchedule}
          rooms={divisionData.rooms}
        />
      )}
    </DivisionTeamsProvider>
  );
};
