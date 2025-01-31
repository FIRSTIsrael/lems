import { Divider, Paper, Stack, Typography } from '@mui/material';
import { PortalActivity, RobotGameMatchStage } from '@lems/types';
import dayjs from 'dayjs';
import { localizedMatchStage } from '../../lib/localization';

interface TeamScheduleProps {
  schedule: PortalActivity<'match' | 'session' | 'general'>[];
}

const TeamSchedule: React.FC<TeamScheduleProps> = ({ schedule }) => {
  return (
    <Paper sx={{ p: 2, pb: 3 }}>
      <Typography variant="h2" gutterBottom>
        לוח הזמנים
      </Typography>
      <Stack spacing={1}>
        {schedule.map((activity, index) => (
          <Stack
            key={index}
            spacing={2}
            direction="row"
            alignItems="center"
            divider={<Divider orientation="vertical" flexItem sx={{ borderWidth: 1 }} />}
          >
            <Typography sx={{ dir: 'ltr' }} variant="body1" fontWeight={500}>
              {dayjs(activity.time).format('HH:mm')}
            </Typography>
            <Typography variant="body1">
              {activity.type === 'match' &&
                `מקצה ${localizedMatchStage[activity.stage as RobotGameMatchStage]} #${activity.round} - שולחן ${activity.table} (#${activity.number})`}
              {activity.type === 'session' &&
                `מפגש שיפוט - חדר ${activity.room} (#${activity.number})`}
              {activity.type === 'general' && activity.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

export default TeamSchedule;
