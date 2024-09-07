import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Paper, Stack, Typography, Button } from '@mui/material';
import { Division, JUDGING_SESSION_LENGTH, JudgingDeliberation, JudgingSession } from '@lems/types';
import { useTime } from '../../hooks/use-time';
import { localizedJudgingCategory } from '@lems/season';
import { apiFetch } from 'apps/frontend/lib/utils/fetch';
import { enqueueSnackbar } from 'notistack';

interface CategoryDeliberationHeaderProps {
  division: WithId<Division>;
  deliberation: WithId<JudgingDeliberation>;
  sessions: Array<WithId<JudgingSession>>;
}

const CategoryDeliberationHeader: React.FC<CategoryDeliberationHeaderProps> = ({
  division,
  deliberation,
  sessions
}) => {
  const router = useRouter();
  const currentTime = useTime({ interval: 10 * 1000 });
  const sessionsEnd =
    dayjs.max(sessions.map(s => dayjs(s.scheduledTime).add(JUDGING_SESSION_LENGTH, 'seconds'))) ??
    dayjs();

  if (sessionsEnd > currentTime || deliberation.status === 'completed') {
    return null;
  }

  const handleStartDeliberation = () => {
    apiFetch(`/api/divisions/${division._id}/deliberations/${deliberation._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: true })
    }).then(res => {
      if (!res.ok) {
        enqueueSnackbar('הדיון לא נמצא.', { variant: 'error' });
        return;
      }
      router.push(`/lems/deliberations/category/${deliberation.category!}`);
    });
  };

  return (
    <Paper sx={{ px: 2, py: 1, mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography>דיום תחום {localizedJudgingCategory[deliberation.category!].name}</Typography>
        <Button variant="contained" onClick={handleStartDeliberation}>
          מעבר לדיון
        </Button>
      </Stack>
    </Paper>
  );
};

export default CategoryDeliberationHeader;
