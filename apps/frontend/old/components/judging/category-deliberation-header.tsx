import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Paper, Typography, Button, Box, Avatar } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Division, JUDGING_SESSION_LENGTH, JudgingDeliberation, JudgingSession } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import { enqueueSnackbar } from 'notistack';
import { useTime } from '../../hooks/time/use-time';
import { apiFetch } from '../../lib/utils/fetch';

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
    if (deliberation.status !== 'not-started') {
      router.push(`/lems/deliberations/category/${deliberation.category}`);
      return;
    }

    apiFetch(`/api/divisions/${division._id}/deliberations/${deliberation._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: true })
    }).then(res => {
      if (!res.ok) {
        enqueueSnackbar('הדיון לא נמצא.', { variant: 'error' });
        return;
      }
      router.push(`/lems/deliberations/category/${deliberation.category}`);
    });
  };

  return (
    <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          p: 3,
          gap: 2
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#fcefdc',
            color: '#ebab2d',
            width: '2rem',
            height: '2rem'
          }}
        >
          <ForumOutlinedIcon sx={{ fontSize: '1rem' }} />
        </Avatar>
        <Typography variant="h2" fontSize="1.25rem" mr={2}>
          { }
          דיון תחום {localizedJudgingCategory[deliberation.category!].name}
        </Typography>
        <Button variant="contained" onClick={handleStartDeliberation} sx={{ minWidth: 150 }}>
          מעבר לדיון
        </Button>
        <Button
          variant="contained"
          component="a"
          href="/lems/deliberations/compare"
          target="_blank"
          endIcon={<OpenInNewRoundedIcon />}
          sx={{ minWidth: 150 }}
        >
          תצוגת השוואה
        </Button>
      </Box>
    </Paper>
  );
};

export default CategoryDeliberationHeader;
