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
  ScoreboardState
} from '@lems/types';

interface ScoreboardConfiguratorProps {
  divisionState: WithId<DivisionState>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ScoreboardConfigurator: React.FC<ScoreboardConfiguratorProps> = ({
  divisionState,
  socket
}) => {
  const [showCurrentMatch, setShowCurrentMatch] = useState<false | 'no-timer' | 'timer'>(
    divisionState.audienceDisplay.scoreboard.showCurrentMatch
  );
  const [showPreviousMatch, setShowPreviousMatch] = useState<boolean>(
    divisionState.audienceDisplay.scoreboard.showPreviousMatch
  );
  const [showSponsors, setShowSponsors] = useState<boolean>(
    divisionState.audienceDisplay.scoreboard.showSponsors
  );

  const updateScoreboardSettings = () => {
    const newScoreboardSettings: ScoreboardState = {
      showCurrentMatch: showCurrentMatch,
      showPreviousMatch: showPreviousMatch,
      showSponsors: showSponsors
    };

    socket.emit(
      'updateAudienceDisplay',
      divisionState.divisionId.toString(),
      { scoreboard: newScoreboardSettings },
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
        <Grid xs={4} alignItems="center" display="flex" flexDirection="column">
          <Typography gutterBottom>הצגת מקצה נוכחי</Typography>
          <ToggleButtonGroup
            value={showCurrentMatch}
            exclusive
            onChange={(division, value) => value !== null && setShowCurrentMatch(value)}
          >
            <ToggleButton sx={{ minWidth: 50 }} value={false}>
              לא
            </ToggleButton>
            <ToggleButton sx={{ minWidth: 50 }} value="timer">
              כן
            </ToggleButton>
            <ToggleButton sx={{ minWidth: 50 }} value="no-timer">
              ללא טיימר
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid xs={4} alignItems="center" display="flex" flexDirection="column">
          <Typography gutterBottom>הצגת מקצה קודם</Typography>
          <ToggleButtonGroup
            value={showPreviousMatch}
            exclusive
            onChange={(division, value) => value !== null && setShowPreviousMatch(value)}
          >
            <ToggleButton sx={{ minWidth: 50 }} value={false}>
              לא
            </ToggleButton>
            <ToggleButton sx={{ minWidth: 50 }} value={true}>
              כן
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid xs={4} alignItems="center" display="flex" flexDirection="column">
          <Typography gutterBottom>הצגת נותני חסות</Typography>
          <ToggleButtonGroup
            value={showSponsors}
            exclusive
            onChange={(division, value) => value !== null && setShowSponsors(value)}
          >
            <ToggleButton sx={{ minWidth: 50 }} value={false}>
              לא
            </ToggleButton>
            <ToggleButton sx={{ minWidth: 50 }} value={true}>
              כן
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid xs={12} alignItems="center" display="flex" flexDirection="column">
          <Button
            sx={{ minWidth: 200 }}
            variant="contained"
            onClick={() => updateScoreboardSettings()}
          >
            שמור
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ScoreboardConfigurator;
