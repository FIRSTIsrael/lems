import { Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  AudienceDisplayScreenTypes,
  EventState,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import { localizedAudienceDisplayScreen } from '../../../localization/field';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';

interface VideoSwitchProps {
  divisionState: EventState;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const VideoSwitch: React.FC<VideoSwitchProps> = ({ divisionState, socket }) => {
  const handleDisplayUpdate = (newScreen: string) => {
    socket.emit(
      'updateAudienceDisplay',
      divisionState.divisionId.toString(),
      { screen: newScreen },
      response => {
        if (!response.ok)
          enqueueSnackbar('אופס, לא הצלחנו לשנות את תצוגת הקהל.', { variant: 'error' });
      }
    );
  };

  return (
    <Paper sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <Paper
        elevation={0}
        sx={theme => ({
          display: 'inline-flex',
          flexWrap: 'wrap',
          backgroundColor: theme.palette.grey[100]
        })}
      >
        <ToggleButtonGroup
          exclusive
          value={divisionState.audienceDisplay.screen}
          onChange={(_e, newValue) => {
            if (newValue !== null) handleDisplayUpdate(newValue);
          }}
          sx={theme => ({
            '& .MuiToggleButtonGroup-grouped': {
              margin: theme.spacing(0.5),
              border: '1px solid transparent',
              px: 1.75,
              py: 1,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider
              },
              '&.Mui-selected:hover': {
                backgroundColor: theme.palette.background.paper,
                opacity: 0.7
              },
              '&.Mui-disabled': {
                border: 0
              },
              '&:not(:first-of-type)': {
                borderRadius: '0.75rem'
              },
              '&:first-of-type': {
                borderRadius: '0.75rem'
              },
              transition: '100ms ease-in-out'
            },
            flexWrap: 'wrap',
            justifyContent: 'center'
          })}
        >
          {AudienceDisplayScreenTypes.map(t => {
            if (divisionState.presentations[t]?.enabled === false) return;
            return (
              <ToggleButton
                value={t}
                key={t}
                sx={{
                  width: 125,
                  '&.Mui-selected': {
                    color: theme => `${theme.palette.primary.main} !important`
                  },
                  fontSize: '1rem'
                }}
              >
                {localizedAudienceDisplayScreen[t]}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Paper>
    </Paper>
  );
};

export default VideoSwitch;
