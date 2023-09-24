import { useMemo } from 'react';
import { RobotGameMatch } from '@lems/types';
import { Box, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { green, red } from '@mui/material/colors';
import { WithId } from 'mongodb';

interface ActiveMatchProps {
  title: React.ReactNode;
  teams: WithId<RobotGameMatch>[];
}

const ActiveMatch: React.FC<ActiveMatchProps> = ({ title, teams }) => {
  const matchName = useMemo(() => (teams[0] ? `מקצה #${teams[0].number}` : null), [teams]);

  return (
    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography component="h2" fontSize="1.125rem" fontWeight={500}>
        {title}
      </Typography>
      <Typography fontSize="1.75rem" fontWeight={700}>
        {matchName || '-'}
      </Typography>

      <Grid container columns={4} spacing={1} mt={2}>
        {teams.map(participant => (
          <Grid key={participant._id.toString()} xs={1}>
            <Box
              sx={{
                color: participant.ready ? green[800] : red[800],
                border: `1px solid ${participant.ready ? green[300] : red[300]}`,
                backgroundColor: participant.ready ? green[100] : red[100],
                borderRadius: '0.5rem',
                px: 1.5,
                py: 0.5
              }}
            >
              <Typography fontWeight={500}>#{participant.team?.number}</Typography>
              <Typography fontSize="0.875rem" color="text.secondary">
                {participant.tableName}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ActiveMatch;
