import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Paper, Stack, Typography, Button } from '@mui/material';
import { JUDGING_SESSION_LENGTH, JudgingDeliberation, JudgingSession } from '@lems/types';
import { useTime } from '../../hooks/use-time';
import { localizedJudgingCategory } from '@lems/season';

interface CategoryDeliberationHeaderProps {
  deliberation: WithId<JudgingDeliberation>;
  sessions: Array<WithId<JudgingSession>>;
}

const CategoryDeliberationHeader: React.FC<CategoryDeliberationHeaderProps> = ({
  deliberation,
  sessions
}) => {
  const router = useRouter();
  const currentTime = useTime({ interval: 10 * 1000 });
  const sessionsEnd =
    dayjs.max(sessions.map(s => dayjs(s.scheduledTime).add(JUDGING_SESSION_LENGTH, 'seconds'))) ??
    dayjs();

  if (sessionsEnd > currentTime) {
    return null;
  }

  return (
    <Paper sx={{ px: 2, py: 1, mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography>דיום תחום {localizedJudgingCategory[deliberation.category!].name}</Typography>
        <Button
          variant="contained"
          onClick={() => router.push(`/lems/deliberations/category/${deliberation.category!}`)}
        >
          מעבר לדיון
        </Button>
      </Stack>
    </Paper>
  );
};

export default CategoryDeliberationHeader;
