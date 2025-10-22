'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Container, Paper, Tabs, Tab } from '@mui/material';
import {
  getEventData,
  getDivisionData,
  mockScoreboardData,
  mockFieldScheduleData,
  mockJudgingScheduleData,
  mockAwardsData
} from './components/mock-event-data';
import { DivisionTeamsList } from './components/division-teams-list';
import { EventDivisionSelector } from './components/event-division-selector';
import { EventHeader } from './components/event-header';
import { DivisionScoreboard } from './components/division-scoreboard';
import { DivisionFieldSchedule } from './components/divison-field-schedule';
import { DivisionJudgingSchedule } from './components/division-judging-schedule';
import { DivisionAwards } from './components/divsion-awards';

const EventPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('pages.event');
  const slug = params.slug as string;

  const eventData = getEventData(slug);
  const divisionId = searchParams.get('divisionId') ?? getEventData(slug).divisions[0].id;
  const divisionData = getDivisionData(slug, divisionId);
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
      <EventDivisionSelector
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
          <Tab label={t('teams')} />
          <Tab label={t('quick-links.scoreboard')} />
          <Tab label={t('quick-links.awards')} />
          <Tab label={t('quick-links.field-schedule')} />
          <Tab label={t('quick-links.judging-schedule')} />
        </Tabs>
      </Paper>

      {selectedTab === 0 && (
        <DivisionTeamsList
          divisionName={divisionData.currentDivision.name}
          teams={divisionData.teams}
        />
      )}

      {selectedTab === 1 && <DivisionScoreboard data={mockScoreboardData} eventSlug={slug} />}

      {selectedTab === 2 && <DivisionAwards awards={mockAwardsData} eventSlug={slug} />}

      {selectedTab === 3 && (
        <DivisionFieldSchedule rounds={mockFieldScheduleData} eventSlug={slug} />
      )}

      {selectedTab === 4 && (
        <DivisionJudgingSchedule sessions={mockJudgingScheduleData} eventSlug={slug} />
      )}
    </Container>
  );
};

export default EventPage;
