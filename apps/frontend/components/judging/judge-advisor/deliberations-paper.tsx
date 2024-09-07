import React from 'react';
import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Paper, Box, Avatar, Typography, Stack, IconButton } from '@mui/material';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { Division, JudgingDeliberation, CATEGORY_DELIBERATION_LENGTH } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import StatusIcon from '../../general/status-icon';

interface DeliberationsPaperProps {
  division: WithId<Division>;
  deliberations: Array<WithId<JudgingDeliberation>>;
}

const DeliberationsPaper: React.FC<DeliberationsPaperProps> = ({ deliberations }) => {
  const categoryDeliberations = deliberations.filter(d => !d.isFinalDeliberation);
  const finalDeliberation = deliberations.find(d => d.isFinalDeliberation)!; // Assert that it exists

  const startJudgingDeliberation = () => {
    console.log('boop');
  };

  return (
    <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2, p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          pb: 3
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#fcefdc',
            color: '#ebab2d',
            width: '2rem',
            height: '2rem',
            mr: 1
          }}
        >
          <EmojiEventsRoundedIcon sx={{ fontSize: '1rem' }} />
        </Avatar>
        <Typography variant="h2" fontSize="1.25rem">
          דיונים
        </Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        {categoryDeliberations.map(d => {
          const endTime = dayjs(d.startTime).add(CATEGORY_DELIBERATION_LENGTH, 'minutes');

          return (
            <Stack width="100%" spacing={2} alignItems="center" key={d.category!}>
              <Typography textAlign="center">
                {localizedJudgingCategory[d.category!].name}
              </Typography>
              <StatusIcon status={d.status} />
              {d.status === 'in-progress' && (
                <Typography>{endTime < dayjs() ? 'מתעכב' : endTime.format('HH:mm')}</Typography>
              )}
            </Stack>
          );
        })}
        <Stack width="100%" spacing={2} alignItems="center">
          <Typography textAlign="center">דיון סופי</Typography>
          {finalDeliberation.status === 'not-started' ? (
            <IconButton
              onClick={() => startJudgingDeliberation()}
              disabled={!categoryDeliberations.every(d => d.status === 'completed')}
            >
              <PlayCircleFilledWhiteOutlinedIcon sx={{ width: 30, height: 30 }} />
            </IconButton>
          ) : (
            <StatusIcon status={finalDeliberation.status} />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DeliberationsPaper;
