import React from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import { useMatchStageTranslations } from '@lems/localization';
import { TeamSchedule } from '@lems/types/api/admin';

interface TeamScheduleViewProps {
  teamSchedule: TeamSchedule | null | undefined;
  isLoading: boolean;
}

export const TeamScheduleView: React.FC<TeamScheduleViewProps> = ({ teamSchedule, isLoading }) => {
  const t = useTranslations('pages.events.schedule.team-swap');
  const { getStage } = useMatchStageTranslations();

  if (!teamSchedule) {
    return null;
  }

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        {t('schedule')}
      </Typography>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Stack spacing={2}>
          {teamSchedule.judgingSession && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {t('judging-session')}
                </Typography>
                <Typography variant="body2">
                  {dayjs(teamSchedule.judgingSession.scheduledTime).format('HH:mm')}
                </Typography>
              </CardContent>
            </Card>
          )}

          {teamSchedule.matches.length > 0 && (
            <>
              <Typography variant="subtitle2" color="text.secondary">
                {t('matches')}
              </Typography>
              {teamSchedule.matches.map(match => (
                <Card key={match.id} variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        {t('match', {
                          round: match.round,
                          number: match.number,
                          stage: getStage(match.stage)
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(match.scheduledTime).format('HH:mm')}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </Stack>
      )}
    </>
  );
};
