'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Container, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import {
  getEventData,
  getDivisionData,
  getAllTeamsForEvent,
  mockScoreboardData,
  mockFieldScheduleData,
  mockJudgingScheduleData,
  mockAwardsData
} from './components/mock-event-data';
import TeamsList from './components/teams-list';
import { DivisionSelector } from './components/division-selector';
import EventHeader from './components/event-header';
import Scoreboard from './components/scoreboard';
import FieldSchedule from './components/field-schedule';
import JudgingSchedule from './components/judging-schedule';
import Awards from './components/awards';

const EventPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('pages.event');
  const slug = params.slug as string;

  const eventData = getEventData(slug);
  const divisionId = searchParams.get('divisionId') ?? getEventData(slug).divisions[0].id;
  const divisionData = getDivisionData(slug, divisionId);
  const allTeams = getAllTeamsForEvent(slug);
  const [selectedTab, setSelectedTab] = useState(0); // Default to scoreboard tab

  const handleDivisionSelect = (selectedDivisionId: string) => {
    router.push(`/event/${slug}?divisionId=${selectedDivisionId}`);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const currentData = divisionData || eventData;
  if (!currentData) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <EventHeader
        seasonName={currentData.seasonName}
        seasonSlug={currentData.seasonSlug}
        eventName={currentData.name}
        startDate={currentData.startDate}
        location={currentData.location}
      />

      {/* Division Picker */}
      <DivisionSelector
        divisions={currentData.divisions}
        currentDivisionId={divisionId}
        onDivisionSelect={handleDivisionSelect}
      />

      {/* Main Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('quick-links.scoreboard')} />
          <Tab label={t('quick-links.awards')} />
          <Tab label={t('quick-links.field-schedule')} />
          <Tab label={t('quick-links.judging-schedule')} />
          <Tab label={t('teams')} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {/* Scoreboard Tab */}
      {selectedTab === 0 && <Scoreboard data={mockScoreboardData} eventSlug={slug} />}

      {/* Awards Tab */}
      {selectedTab === 1 && <Awards awards={mockAwardsData} eventSlug={slug} />}

      {/* Field Schedule Tab */}
      {selectedTab === 2 && <FieldSchedule rounds={mockFieldScheduleData} eventSlug={slug} />}

      {/* Judging Schedule Tab */}
      {selectedTab === 3 && <JudgingSchedule sessions={mockJudgingScheduleData} eventSlug={slug} />}

      {/* Teams Tab */}
      {selectedTab === 4 && divisionData && (
        <Paper sx={{ p: 3 }}>
          <TeamsList
            teams={divisionData.teams}
            divisionColor={divisionData.currentDivision.color}
          />
        </Paper>
      )}

      {selectedTab === 4 && !divisionData && allTeams && (
        <Paper sx={{ p: 3 }}>
          <TeamsList teams={allTeams} divisionColor="#666666" />
        </Paper>
      )}

      {selectedTab === 4 && !divisionData && !allTeams && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      )}
    </Container>
  );
};

export default EventPage;
