import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Divider, Paper, Stack, Typography } from '@mui/material';
import { PortalActivity, RobotGameMatchStage } from '@lems/types';
import { useLocaleMatchStage } from '../../locale/hooks/use-locale-match-stage';

interface TeamScheduleProps {
  schedule: PortalActivity<'match' | 'session' | 'general'>[];
}

const TeamSchedule: React.FC<TeamScheduleProps> = ({ schedule }) => {
  const t = useTranslations('components.teams.team-schedule');
  const matchStageToText = useLocaleMatchStage();

  return (
    <Paper sx={{ p: 2, pb: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('title')}
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
                t('activity.match', {
                  stage: matchStageToText(activity.stage as RobotGameMatchStage),
                  table: activity.table,
                  round: activity.round,
                  number: activity.number
                })}
              {activity.type === 'session' &&
                t('activity.session', {
                  room: activity.room,
                  number: activity.number
                })}
              {activity.type === 'general' && activity.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

export default TeamSchedule;
