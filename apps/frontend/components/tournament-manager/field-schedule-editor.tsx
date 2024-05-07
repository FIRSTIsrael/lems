import { useState } from 'react';
import { WithId } from 'mongodb';
import { Button, Stack } from '@mui/material';
import {
  Event,
  EventState,
  Team,
  RobotGameMatch,
  RobotGameTable,
  RobotGameMatchStage,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import RoundScheduleEditor from './round-schedule-editor';
import { purple } from '@mui/material/colors';
import { localizedMatchStage } from '../../localization/field';
import { Socket } from 'socket.io-client';

type RoundInfo = { stage: RobotGameMatchStage; number: number };

interface FieldScheduleEditorProps {
  division: WithId<Event>;
  divisionState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const FieldScheduleEditor: React.FC<FieldScheduleEditorProps> = ({
  division,
  divisionState,
  teams,
  tables,
  matches,
  socket
}) => {
  const practiceMatches = matches.filter(m => m.stage === 'practice');
  const rankingMatches = matches.filter(m => m.stage === 'ranking');

  const rounds: Array<RoundInfo> = [...new Set(practiceMatches.flatMap(m => m.round))]
    .map(r => {
      return { stage: 'practice', number: r } as RoundInfo;
    })
    .concat(
      [...new Set(rankingMatches.flatMap(m => m.round))].map(r => {
        return { stage: 'ranking', number: r } as RoundInfo;
      })
    );

  const [activeRound, setActiveRound] = useState<RoundInfo>(rounds[0]);

  return (
    <Stack spacing={2}>
      <Stack justifyContent="center" direction="row" spacing={2}>
        {rounds.map(r => (
          <Button
            key={r.stage + r.number}
            variant="contained"
            color="inherit"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor:
                r.stage === activeRound.stage && r.number === activeRound.number
                  ? purple[700]
                  : 'transparent',
              color:
                r.stage === activeRound.stage && r.number === activeRound.number
                  ? '#fff'
                  : purple[700],
              borderRadius: '2rem',
              '&:hover': {
                backgroundColor:
                  r.stage === activeRound.stage && r.number === activeRound.number
                    ? purple[700]
                    : purple[700] + '1f'
              }
            }}
            onClick={() => setActiveRound(r)}
          >
            סבב {localizedMatchStage[r.stage]} #{r.number}
          </Button>
        ))}
      </Stack>
      <RoundScheduleEditor
        division={division}
        divisionState={divisionState}
        roundStage={activeRound.stage}
        roundNumber={activeRound.number}
        matches={matches.filter(
          m => m.round === activeRound.number && m.stage === activeRound.stage
        )}
        tables={tables}
        teams={teams}
        socket={socket}
      />
    </Stack>
  );
};

export default FieldScheduleEditor;
