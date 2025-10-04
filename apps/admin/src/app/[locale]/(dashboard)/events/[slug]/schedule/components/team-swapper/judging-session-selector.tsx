import React from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Box, Typography, CircularProgress, Stack, Chip, Card, CardContent } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { Team } from '@lems/types/api/admin';
import { RoomWithTeam } from './types';
import { JudgingSessionTime } from './utils';

interface JudgingSessionSelectorProps {
  selectedTeamId: string | null;
  judgingSessionTimes: JudgingSessionTime[];
  teams: Team[];
  isLoading: boolean;
  onRoomSelect: (room: RoomWithTeam) => void;
}

export const JudgingSessionSelector: React.FC<JudgingSessionSelectorProps> = ({
  selectedTeamId,
  judgingSessionTimes,
  teams,
  isLoading,
  onRoomSelect
}) => {
  const t = useTranslations('pages.events.schedule.team-swap');

  if (!selectedTeamId) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {t('select-team-to-continue')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {t('select-judging-time')}
      </Typography>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Stack spacing={3}>
          {judgingSessionTimes.map((timeSlot, index) => (
            <Box key={index}>
              <Chip
                icon={<Schedule />}
                label={dayjs(timeSlot.time).format('HH:mm')}
                color="primary"
                variant="outlined"
                sx={{ mb: 1.5 }}
              />
              <Stack spacing={1}>
                {timeSlot.rooms.map(room => {
                  const isCurrentTeam = room.teamId === selectedTeamId;
                  const isEmpty = !room.teamId;
                  const isDisabled = isCurrentTeam || isEmpty;
                  const roomTeam = teams.find(t => t.id === room.teamId);

                  return (
                    <Card
                      key={room.id}
                      variant="outlined"
                      sx={{
                        cursor: isDisabled ? 'default' : 'pointer',
                        opacity: isDisabled ? 0.5 : 1,
                        '&:hover': {
                          bgcolor: isDisabled ? 'inherit' : 'action.hover'
                        }
                      }}
                      onClick={() => {
                        if (!isDisabled && room.session) {
                          onRoomSelect({
                            roomId: room.id,
                            roomName: room.name,
                            sessionId: room.session.id,
                            teamId: room.teamId,
                            teamNumber: roomTeam?.number,
                            time: timeSlot.time
                          });
                        }
                      }}
                    >
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={500}>
                            {room.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isEmpty
                              ? t('empty')
                              : isCurrentTeam
                                ? t('current-team')
                                : t('unknown-team', {number: roomTeam?.number || '?'})}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </>
  );
};
