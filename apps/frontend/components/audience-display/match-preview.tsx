import React from 'react';
import { WithId } from 'mongodb';
import { Division, RobotGameMatch } from '@lems/types';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { localizedMatchStage } from '../../localization/field';
import Grid from '@mui/material/Unstable_Grid2';
import { blue, red } from '@mui/material/colors';
import Image from 'next/image';

interface MatchPreviewProps {
  division: WithId<Division>;
  match?: WithId<RobotGameMatch>;
}

const MatchPreview: React.FC<MatchPreviewProps> = ({ division, match }) => {
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
        <Grid container component={Paper} width="80%" height="80%" pb={4} px={6} textAlign="center">
          <Grid xs={3} position="relative">
            <Image
              fill
              style={{ objectFit: 'contain', padding: 24 }}
              src="/assets/audience-display/first-israel-horizontal.svg"
              alt="לוגו של FIRST ישראל"
            />
          </Grid>
          <Grid xs={6} display="flex" alignItems="center" justifyContent="center">
            <Typography fontSize="5rem" fontWeight={700}>
              סבב {localizedMatchStage[match.stage]} #{match.round}
            </Typography>
          </Grid>
          <Grid xs={3} position="relative">
            <Image
              fill
              style={{ objectFit: 'contain', padding: 16 }}
              src="/assets/audience-display/technion-horizontal.svg"
              alt="לוגו של הטכניון"
            />
          </Grid>
          <Grid xs={12}>
            <Typography fontSize="5rem" fontWeight={700} color="text.secondary">
              מקצה #{match.number}
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
                      color: division.color === 'red' ? red[800] : blue[800],
                      border: `1px solid ${division.color === 'red' ? red[300] : blue[300]}`,
                      backgroundColor: division.color === 'red' ? red[100] : blue[100]
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
