import { WithId } from 'mongodb';
import React, { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Socket } from 'socket.io-client';
import {
  Paper,
  Button,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import {
  Event,
  Team,
  TicketType,
  TicketTypes,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import { localizedTicketTypes } from '../../localization/tickets';
import TeamSelection from '../general/team-selection';

interface TicketCreationPanelProps {
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  division: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const TicketCreationPanel: React.FC<TicketCreationPanelProps> = ({ socket, division, teams }) => {
  const [team, setTeam] = useState<WithId<Team> | null>(null);
  const [content, setContent] = useState<string>('');
  const [type, setType] = useState<TicketType>('general');

  const createTicket = () => {
    socket.emit(
      'createTicket',
      division._id.toString(),
      team ? team._id.toString() : null,
      content,
      type,
      response => {
        if (response.ok) {
          setTeam(null);
          setContent('');
          setType('general');
          enqueueSnackbar('הבקשה נשלחה בהצלחה!', { variant: 'success' });
        }
      }
    );
  };

  return (
    <Paper sx={{ p: 4 }}>
      {teams && (
        <Stack spacing={2}>
          <TeamSelection teams={teams} value={team} setTeam={setTeam} />
          <TextField
            label="תוכן הבקשה"
            value={content}
            onChange={e => setContent(e.target.value)}
            multiline
            rows={3}
          />
          <FormControl fullWidth>
            <InputLabel id="type-select-label">סוג הבקשה</InputLabel>
            <Select
              labelId="type-select-label"
              label="סוג הבקשה"
              value={type}
              onChange={e => setType(e.target.value as TicketType)}
            >
              {TicketTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {localizedTicketTypes[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box justifyContent="flex-end" display="flex" pt={2}>
            <Button
              sx={{ borderRadius: 8 }}
              variant="contained"
              disabled={!content || !type}
              onClick={createTicket}
              endIcon={<CreateOutlinedIcon />}
            >
              פתיחת הבקשה
            </Button>
          </Box>
        </Stack>
      )}
    </Paper>
  );
};

export default TicketCreationPanel;
