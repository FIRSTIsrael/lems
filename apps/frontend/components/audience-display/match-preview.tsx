import React from 'react';
import { WithId } from 'mongodb';
import { Event, RobotGameMatch } from '@lems/types';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { localizedMatchStage } from '../../localization/field';
import Grid from '@mui/material/Unstable_Grid2';
import { blue, red } from '@mui/material/colors';

interface MatchPreviewProps {
  event: WithId<Event>;
  match?: WithId<RobotGameMatch>;
}

const MatchPreview: React.FC<MatchPreviewProps> = ({ event, match }) => {
  return (
    <Box
      height="100%"
      width="100%"
      position="absolute"
      top={0}
      left={0}
      sx={{
        backgroundImage: 'url(/assets/audience-display/season-background.webp)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="center"
    >
      {match && (
        <Grid container component={Paper} width="80%" height="80%" p={8} textAlign="center">
          <Grid xs={12}>
            <Typography fontSize="7.5rem" fontWeight={700}>
              {localizedMatchStage[match.stage]} #{match.number}
            </Typography>
          </Grid>
          <Grid xs={12}>
            <Typography fontSize="5rem" fontWeight={700} color="text.secondary">
              סבב {match.round}
            </Typography>
          </Grid>
          <Grid
            xs={12}
            container
            spacing={2}
            columns={match.participants.filter(p => p.teamId).length}
          >
            {match.participants
              .filter(p => p.teamId)
              .map(p => (
                <Grid xs={1} key={p.teamId?.toString()}>
                  <Stack
                    sx={{
                      color: event.color === 'red' ? red[800] : blue[800],
                      border: `1px solid ${event.color === 'red' ? red[300] : blue[300]}`,
                      backgroundColor: event.color === 'red' ? red[100] : blue[100]
                    }}
                    borderRadius="0.5rem"
                    px={5}
                    py={3}
                    height="100%"
                    justifyContent="space-between"
                  >
                    <Typography fontSize="3.5rem" fontWeight={700}>
                      {p.team && `#${p.team.number}`}
                    </Typography>
                    <Typography fontSize="2.5rem" fontWeight={700} sx={{ wordWrap: 'break-word' }}>
                      {p.team && p.team.name}
                    </Typography>
                    <Typography fontSize="1.5rem" fontWeight={500}>
                      {p.team && `${p.team.affiliation.name}, ${p.team.affiliation.city}`}
                    </Typography>
                    <Typography fontSize="1.25rem" fontWeight={700} color="text.secondary">
                      שולחן {p.tableName && p.tableName}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MatchPreview;
