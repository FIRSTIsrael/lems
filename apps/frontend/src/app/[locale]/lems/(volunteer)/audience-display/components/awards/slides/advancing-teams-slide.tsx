import React from 'react';
import { Stack, Box, Typography, Grid } from '@mui/material';
import { Slide, Stepper } from '@lems/presentations';
import { Award, TeamWinner } from '../graphql/types';

interface AdvancingTeamsSlideProps {
  awards: Award[];
}

export const AdvancingTeamsSlide: React.FC<AdvancingTeamsSlideProps> = ({ awards }) => {
  const teams: TeamWinner[] = awards
    .filter(award => award.winner && 'team' in award.winner)
    .map(award => award.winner as TeamWinner);

  if (teams.length === 0) {
    return null;
  }

  return (
    <Slide>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={4}
        sx={{
          height: '100%',
          width: '100%',
          px: 20,
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h2"
          sx={{ fontSize: '4.5rem', fontWeight: 'bold', color: 'white', mb: 4 }}
        >
          קבוצות מתקדמות
        </Typography>
        <Grid container spacing={4} sx={{ maxWidth: '64rem' }}>
          <Stepper
            values={teams as unknown[]}
            render={(team: unknown) => {
              const teamData = team as TeamWinner;
              return (
                <Grid size={6} key={teamData.team.id}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: 'success.main',
                      transform: 'scale(1.05)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography sx={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>
                      #{teamData.team.number}
                    </Typography>
                    <Typography sx={{ fontSize: '1.5rem', color: 'white', mt: 1 }}>
                      {teamData.team.name}
                    </Typography>
                  </Box>
                </Grid>
              );
            }}
          />
        </Grid>
      </Stack>
    </Slide>
  );
};
