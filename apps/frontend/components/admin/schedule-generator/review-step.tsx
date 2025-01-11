import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Chip, Stack, Switch, Typography, Button } from '@mui/material';
import {
  JudgingRoom,
  RobotGameTable,
  Team,
  Division,
  ScheduleGenerationSettings
} from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';

interface ReviewStepProps {
  division: WithId<Division>;
  settings: ScheduleGenerationSettings;
  advanceStep: () => void;
  goBack: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ division, settings, advanceStep, goBack }) => {
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

  if (teams === null || rooms === null || tables === null) return null;

  return (
    <Stack spacing={2} justifyContent="center">
      <Typography variant="h6">סיכום</Typography>
      <Typography>מספר קבוצות: {teams?.length}</Typography>
      <Typography variant="h6">זירה</Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography>שולחנות:</Typography>
        {tables.map((table, index) => (
          <Chip key={index} label={table.name} />
        ))}
      </Stack>
      <Typography>מספר סבבי אימונים: {settings.practiceRounds}</Typography>
      <Typography>מספר סבבי דירוג: {settings.rankingRounds}</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography>הרצה מדורגת:</Typography>
        <Switch checked={settings.isStaggered} disabled />
      </Stack>
      <Typography>מספר משחקים בכל סבב: {Math.ceil(teams.length / tables.length)}</Typography>
      <Typography>
        מחזור מקצי אימונים:{' '}
        {dayjs()
          .startOf('day')
          .add(settings.practiceCycleTimeSeconds ?? 0, 'seconds')
          .format('mm:ss')}{' '}
        דקות
      </Typography>
      <Typography>
        מחזור מקצי דירוג:{' '}
        {dayjs()
          .startOf('day')
          .add(settings.rankingCycleTimeSeconds ?? 0, 'seconds')
          .format('mm:ss')}{' '}
        דקות
      </Typography>
      <Typography>הפסקות:</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        {settings.breaks
          .filter(({ eventType }) => eventType === 'match')
          .map(({ after, durationSeconds }, index) => {
            const formattedDuration = dayjs()
              .startOf('day')
              .add(durationSeconds, 'second')
              .format('mm:ss');

            return (
              <Chip key={index} label={`לאחר מקצה ${after} באורך ${formattedDuration} דקות`} />
            );
          })}
      </Stack>

      <Typography variant="h6">שיפוט</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography>חדרי שיפוט:</Typography>
        {rooms.map((room, index) => (
          <Chip key={index} label={room.name} />
        ))}
      </Stack>
      <Typography>מספר סבבי שיפוט: {Math.ceil(teams.length / rooms.length)}</Typography>
      <Typography>
        מחזור מפגשי שיפוט:{' '}
        {dayjs()
          .startOf('day')
          .add(settings.judgingCycleTimeSeconds ?? 0, 'seconds')
          .format('mm:ss')}{' '}
        דקות
      </Typography>
      <Typography>הפסקות:</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        {settings.breaks
          .filter(({ eventType }) => eventType === 'judging')
          .map(({ after, durationSeconds }, index) => {
            const formattedDuration = dayjs()
              .startOf('day')
              .add(durationSeconds, 'second')
              .format('mm:ss');

            return (
              <Chip key={index} label={`לאחר מקצה ${after} באורך ${formattedDuration} דקות`} />
            );
          })}
      </Stack>
      <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" px={2}>
        <Button variant="contained" onClick={goBack}>
          הקודם
        </Button>
        <Button variant="contained" onClick={() => advanceStep()}>
          הבא
        </Button>
      </Stack>
    </Stack>
  );
};

export default ReviewStep;
