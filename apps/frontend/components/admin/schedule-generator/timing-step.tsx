import { WithId } from 'mongodb';
import { Button, Stack } from '@mui/material';
import {
  Division,
  FllEvent,
  JudgingRoom,
  RobotGameTable,
  ScheduleGenerationSettings,
  Team
} from '@lems/types';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/utils/fetch';
import dayjs from 'dayjs';

const EVENT_TYPE_TO_COLOR = {
  JUDGING: '#d87cac',
  PRACTICE: '#ffda22',
  RANKING: '#004f2d',
  FIELD_BREAK: '#091e05',
  JUDGING_BREAK: '#f9b9c3'
};

interface CalenderEvent {
  id: string;
  start: string;
  end: string;
  title: string;
  backgroundColor: string;
}

interface TimingStepProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
  settings: ScheduleGenerationSettings;
  updateSettings: (settings: ScheduleGenerationSettings) => void;
  advanceStep: () => void;
  goBack: () => void;
}

const TimingStep: React.FC<TimingStepProps> = ({
  event,
  division,
  settings,
  updateSettings,
  advanceStep,
  goBack
}) => {
  const [teams, setTeams] = useState<Array<WithId<Team>> | null>(null);
  const [rooms, setRooms] = useState<Array<WithId<JudgingRoom>> | null>(null);
  const [tables, setTables] = useState<Array<WithId<RobotGameTable>> | null>(null);

  const fetchTeams = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/teams`);
    const data = await response.json();
    setTeams(data);
  };

  const fetchRooms = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/rooms`);
    const data = await response.json();
    setRooms(data);
  };

  const fetchTables = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/tables`);
    const data = await response.json();
    setTables(data);
  };

  useEffect(() => {
    fetchTeams();
    fetchRooms();
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const events = useMemo(() => {
    if (!teams || !rooms || !tables) return [];

    const result: CalenderEvent[] = [];
    let matchesPerRound = Math.ceil(teams.length / tables.length);
    if (settings.isStaggered) matchesPerRound *= 2;
    const practiceRoundLength = matchesPerRound * (settings.practiceCycleTimeSeconds ?? 0);
    const rankingRoundLength = matchesPerRound * (settings.rankingCycleTimeSeconds ?? 0);

    Array.from({ length: settings.practiceRounds }).forEach((_, i) => {
      const start = dayjs(event.startDate).add(i * practiceRoundLength, 'seconds');
      const end = start.add(practiceRoundLength, 'seconds');
      const title = `סבב אימונים ${i + 1}`;
      const calendarEvent = {
        id: `practice-${i}`,
        start: start.toISOString(),
        end: end.toISOString(),
        title,
        backgroundColor: EVENT_TYPE_TO_COLOR.PRACTICE
      };
      result.push(calendarEvent);
    });

    Array.from({ length: settings.rankingRounds }).forEach((_, i) => {
      const start = dayjs(event.startDate).add(i * rankingRoundLength, 'seconds');
      const end = start.add(rankingRoundLength, 'seconds');
      const title = `סבב דירוג ${i + 1}`;
      const calendarEvent = {
        id: `ranking-${i}`,
        start: start.toISOString(),
        end: end.toISOString(),
        title,
        backgroundColor: EVENT_TYPE_TO_COLOR.RANKING
      };
      result.push(calendarEvent);
    });

    const judgingSessions = Math.ceil(teams.length / rooms.length);

    Array.from({ length: judgingSessions }).forEach((_, i) => {
      const start = dayjs(event.startDate).add(
        i * (settings.judgingCycleTimeSeconds ?? 0),
        'seconds'
      );
      const end = start.add(settings.judgingCycleTimeSeconds ?? 0, 'seconds');
      const title = `סבב שיפוט ${i + 1}`;
      const calendarEvent = {
        id: `judging-${i}`,
        start: start.toISOString(),
        end: end.toISOString(),
        title,
        backgroundColor: EVENT_TYPE_TO_COLOR.JUDGING
      };
      result.push(calendarEvent);
    });

    return result;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rooms?.length,
    teams?.length,
    tables?.length,
    settings.isStaggered,
    settings.judgingCycleTimeSeconds,
    settings.judgingStart,
    settings.rankingCycleTimeSeconds
  ]);

  const canAdvanceStep = settings.matchesStart && settings.judgingStart;

  return (
    <>
      <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" px={2}>
        <Button variant="contained" onClick={goBack}>
          הקודם
        </Button>
        <Button variant="contained" onClick={advanceStep} disabled={!canAdvanceStep}>
          הבא
        </Button>
      </Stack>
    </>
  );
};

export default TimingStep;
