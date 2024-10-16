import { WithId } from 'mongodb';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Socket } from 'socket.io-client';
import { Stack, TextField, Typography, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { localizedAward } from '@lems/season';
import { Award, WSClientEmittedEvents, WSServerEmittedEvents, AwardNames } from '@lems/types';

interface PersonalAwardWinnerSelectorProps {
  title: AwardNames;
  awards: Array<WithId<Award>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const PersonalAwardWinnerSelector: React.FC<PersonalAwardWinnerSelectorProps> = ({
  title,
  awards,
  socket
}) => {
  const divisionId = awards[0].divisionId;
  const [winners, setWinners] = useState(awards.map(award => award.winner));

  const updateAwardWinners = () => {
    socket.emit('updateAwardWinners', String(divisionId), { [title]: winners }, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, לא הצלחנו לעדכן את הפרס.', {
          variant: 'error'
        });
      }
    });
  };

  return (
    <Stack>
      <Typography fontSize="1rem" fontWeight={700}>
        פרס {localizedAward[title].name}
      </Typography>
      {awards.map((award, index) => (
        <Stack direction="row" spacing={2} p={2} alignItems="center">
          <Typography fontSize="0.875rem" color="text.secondary" width="12%">
            מקום {award.place}
          </Typography>
          <TextField
            label="זוכה"
            value={award.winner ?? winners[index]}
            onChange={e =>
              setWinners(winners => winners.map((w, i) => (i === index ? e.target.value : w)))
            }
            disabled={!!award.winner}
            fullWidth
          />
        </Stack>
      ))}
      <Button
        sx={{ width: 200 }}
        variant="contained"
        onClick={updateAwardWinners}
        disabled={
          !winners.every(w => !!w && typeof w === 'string') ||
          awards.every(a => !!a.winner && typeof a.winner === 'string')
        }
        endIcon={<LockOutlinedIcon />}
      >
        נעילת הפרס
      </Button>
    </Stack>
  );
};

export default PersonalAwardWinnerSelector;
