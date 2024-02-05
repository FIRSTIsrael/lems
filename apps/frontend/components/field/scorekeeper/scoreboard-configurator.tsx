import React, { useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import {
  Button,
  Paper,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box
} from '@mui/material';
import {
  EventState,
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  ScoreboardState
} from '@lems/types';

interface ScoreboardConfiguratorProps {
  eventState: WithId<EventState>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ScoreboardConfigurator: React.FC<ScoreboardConfiguratorProps> = ({ eventState, socket }) => {
  const [showCurrentMatch, setShowCurrentMatch] = useState<false | 'no-timer' | 'timer'>(
    eventState.audienceDisplay.scoreboard.showCurrentMatch
  );
  const [showPreviousMatch, setShowPreviousMatch] = useState<boolean>(
    eventState.audienceDisplay.scoreboard.showPreviousMatch
  );
  const [showSponsors, setShowSponsors] = useState<boolean>(
    eventState.audienceDisplay.scoreboard.showSponsors
  );

  const updateScoreboardSettings = () => {
    const newScoreboardSettings: ScoreboardState = {
      showCurrentMatch: showCurrentMatch,
      showPreviousMatch: showPreviousMatch,
      showSponsors: showSponsors
    };

    socket.emit(
      'updateAudienceDisplay',
      eventState.eventId.toString(),
      { scoreboard: newScoreboardSettings },
      response => {
        if (!response.ok) enqueueSnackbar('אופס, עדכון מסך הניקוד נכשל.', { variant: 'error' });
      }
    );
  };

  return (
    <Stack
      component={Paper}
      p={4}
      mt={2}
      justifyContent="center"
      spacing={2}
      maxWidth="75%"
      minWidth={450}
    >
      <Stack justifyContent="center" spacing={2}>
        <Stack direction="row" spacing={2}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography>הצג מקצה נוכחי</Typography>
            <ToggleButtonGroup
              value={showCurrentMatch}
              exclusive
              onChange={(event, value) => value !== null && setShowCurrentMatch(value)}
            >
              <ToggleButton value={false}>לא</ToggleButton>
              <ToggleButton value="timer">כן</ToggleButton>
              <ToggleButton value="no-timer">ללא טיימר</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography>הצג מקצה קודם</Typography>
            <ToggleButtonGroup
              value={showPreviousMatch}
              exclusive
              onChange={(event, value) => value !== null && setShowPreviousMatch(value)}
            >
              <ToggleButton value={false}>לא</ToggleButton>
              <ToggleButton value={true}>כן</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography>הצג נותני חסות</Typography>
            <ToggleButtonGroup
              value={showSponsors}
              exclusive
              onChange={(event, value) => value !== null && setShowSponsors(value)}
            >
              <ToggleButton value={false}>לא</ToggleButton>
              <ToggleButton value={true}>כן</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
        <Button variant="contained" onClick={() => updateScoreboardSettings()}>
          שמור
        </Button>
      </Stack>
    </Stack>
  );
};

export default ScoreboardConfigurator;
