import { WithId } from 'mongodb';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Socket } from 'socket.io-client';
import { Paper, TextField, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { localizedAward } from '@lems/season';
import { Award, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';

interface AwardWinnerSelectorProps {
  award: WithId<Award>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const AwardWinnerSelector: React.FC<AwardWinnerSelectorProps> = ({ award, socket }) => {
  const [winner, setWinner] = useState('');

  const updateAward = () => {
    socket.emit(
      'updateAwardWinners',
      award.divisionId.toString(),
      { [award.name]: winner },
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, לא הצלחנו לעדכן את הפרס.', {
            variant: 'error'
          });
        }
      }
    );
  };

  return (
    <Grid container key={award._id.toString()} columnSpacing={2} p={2} alignItems="center">
      <Grid xs={4}>
        <Typography fontSize="1rem" fontWeight={700}>
          פרס {localizedAward[award.name].name}
        </Typography>
        <Typography fontSize="0.875rem" color="text.secondary">
          מקום {award.place}
        </Typography>
      </Grid>
      <Grid xs={5}>
        <TextField
          label="זוכה"
          value={winner}
          onChange={e => setWinner(e.target.value)}
          disabled={!!award.winner}
          fullWidth
        />
      </Grid>
      <Grid xs={3}>
        <Button
          fullWidth
          variant="contained"
          onClick={updateAward}
          disabled={!!award.winner}
          endIcon={<LockOutlinedIcon />}
        >
          נעילת הפרס
        </Button>
      </Grid>
    </Grid>
  );
};

export default AwardWinnerSelector;
