'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  EventData,
  DivisionData,
  Team,
  getEventData,
  getDivisionData,
  getAllTeamsForEvent,
  mockScoreboardData,
  mockFieldScheduleData,
  mockJudgingScheduleData,
  mockAwardsData
} from './components/mock-event-data';
import TeamsList from './components/teams-list';
import DivisionPicker from './components/division-picker';
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

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [divisionData, setDivisionData] = useState<DivisionData | null>(null);
  const [allTeams, setAllTeams] = useState<Team[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0); // Default to scoreboard tab

  const slug = params.slug as string;
  const divisionId = searchParams.get('divisionId');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (divisionId) {
          const data = await getDivisionData(slug, divisionId);
          setDivisionData(data);
          setEventData(null);
          setAllTeams(null);
        } else {
          const [eventDataResult, allTeamsResult] = await Promise.all([
            getEventData(slug),
            getAllTeamsForEvent(slug)
          ]);
          setEventData(eventDataResult);
          setAllTeams(allTeamsResult);
          setDivisionData(null);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event data');
        setLoading(false);
      }
    };

    fetchEventData();
  }, [slug, divisionId]);

  const handleDivisionSelect = (selectedDivisionId: string) => {
    router.push(`/event/${slug}?divisionId=${selectedDivisionId}`);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

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
      <DivisionPicker
        divisions={currentData.divisions}
        currentDivisionId={divisionData?.currentDivision?.id || null}
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
      {selectedTab === 0 && (
        <Scoreboard data={mockScoreboardData} eventSlug={slug} />
      )}

      {/* Awards Tab */}
      {selectedTab === 1 && (
        <Awards awards={mockAwardsData} eventSlug={slug} />
      )}

      {/* Field Schedule Tab */}
      {selectedTab === 2 && (
        <FieldSchedule rounds={mockFieldScheduleData} eventSlug={slug} />
      )}

      {/* Judging Schedule Tab */}
      {selectedTab === 3 && (
        <JudgingSchedule sessions={mockJudgingScheduleData} eventSlug={slug} />
      )}

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
