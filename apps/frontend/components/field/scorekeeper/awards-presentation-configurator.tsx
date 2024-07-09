import React, { useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { Button, Paper, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  DivisionState,
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  AwardsPresentationState
} from '@lems/types';

interface AwardsPresentationConfiguratorProps {
  divisionState: WithId<DivisionState>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const AwardsPresentationConfigurator: React.FC<AwardsPresentationConfiguratorProps> = ({
  divisionState,
  socket
}) => {
  const [awardWinnerSlideStyle, setAwardWinnerSlideStyle] = useState<'chroma' | 'full' | 'both'>(
    divisionState.audienceDisplay.awardsPresentation.awardWinnerSlideStyle
  );

  const updateAwardsPresentationSetting = () => {
    const newAwardsPresentation: AwardsPresentationState = {
      awardWinnerSlideStyle: awardWinnerSlideStyle
    };

    socket.emit(
      'updateAudienceDisplay',
      divisionState.divisionId.toString(),
      { awardsPresentation: newAwardsPresentation },
      response => {
        if (!response.ok) enqueueSnackbar('אופס, עדכון תצוגת הקהל נכשל.', { variant: 'error' });
      }
    );
  };

  return (
    <Paper
      sx={{
        p: 4,
        mt: 2,
        display: 'flex',
        justifyContent: 'center',
        minWidth: 350,
        maxWidth: '75%'
      }}
    >
      <Grid container spacing={2}>
        <Grid xs={12} alignItems="center" display="flex" flexDirection="column">
          <Typography gutterBottom>סגנון שקופיות זוכים</Typography>
          <ToggleButtonGroup
            value={awardWinnerSlideStyle}
            exclusive
            onChange={(division, value) => value !== null && setAwardWinnerSlideStyle(value)}
          >
            <ToggleButton sx={{ minWidth: 50 }} value="chroma">
              כרומה
            </ToggleButton>
            <ToggleButton sx={{ minWidth: 50 }} value="full">
              מלא
            </ToggleButton>
            <ToggleButton sx={{ minWidth: 50 }} value="both">
              שניהם
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid xs={12} alignItems="center" display="flex" flexDirection="column">
          <Button
            sx={{ minWidth: 200 }}
            variant="contained"
            onClick={() => updateAwardsPresentationSetting()}
          >
            שמור
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AwardsPresentationConfigurator;
