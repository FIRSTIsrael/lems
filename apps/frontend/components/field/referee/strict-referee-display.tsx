import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import {
  Division,
  DivisionState,
  RobotGameMatch,
  RobotGameMatchParticipant,
  RobotGameTable,
  Scoresheet,
  Team,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import WaitForMatchStart from './wait-for-start';
import MatchPrestart from './prestart';
import NoMatchCard from './no-match-card';
import Timer from './timer';
import { apiFetch } from '../../../lib/utils/fetch';
import { Stack } from '@mui/material';
import TableSchedule from './table-schedule';

type StrictRefereeDisplayState = 'timer' | 'prestart' | 'no-match' | undefined;

interface MatchPrestartProps {
  division: WithId<Division>;
  table: WithId<RobotGameTable>;
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const StrictRefereeDisplay: React.FC<MatchPrestartProps> = ({
  division,
  table,
  divisionState,
  teams,
  matches,
  socket
}) => {
  const router = useRouter();
  const [displayState, setDisplayState] = useState<StrictRefereeDisplayState>(undefined);
  const [match, setMatch] = useState<WithId<RobotGameMatch> | undefined>(undefined);
  const [prestartInspection, setPrestartInspection] = useState<boolean | null>(null);

  const participant = useMemo(
    () => match?.participants.filter(p => p.teamId).find(p => p.tableId === table._id),
    [match?.participants, table._id]
  );

  const updateMatchParticipant = useCallback(
    (updatedMatchParticipant: Partial<Pick<RobotGameMatchParticipant, 'present' | 'ready'>>) => {
      if (!match || !participant || !participant.teamId) return;
      socket.emit(
        'updateMatchParticipant',
        match.divisionId.toString(),
        match._id.toString(),
        {
          teamId: participant.teamId.toString(),
          ...updatedMatchParticipant
        },
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
          }
        }
      );
    },
    [socket, match, participant]
  );

  const toScoresheet = useCallback(
    (participant: RobotGameMatchParticipant, scoresheet: WithId<Scoresheet>) => {
      let url = `/lems/team/${participant?.team?._id}/scoresheet/${scoresheet._id}`;
      if (prestartInspection !== null) url += `?inspection=${prestartInspection}`;
      router.push(url);
    },
    [division._id, prestartInspection, router]
  );

  const getScoresheet = useCallback(
    (fromMatch: WithId<RobotGameMatch>) => {
      const fromParticipant = fromMatch.participants.find(p => p.tableId === table._id);

      return apiFetch(
        `/api/divisions/${division._id}/teams/${fromParticipant?.teamId}/scoresheets/?stage=${fromMatch?.stage}&round=${fromMatch?.round}`
      ).then<WithId<Scoresheet>>(res => res.json());
    },
    [division._id, table._id]
  );

  useEffect(() => {
    const activeMatch = matches.find(m => m._id === divisionState.activeMatch);
    const isActiveInTable = !!activeMatch?.participants
      .filter(p => p.teamId)
      .find(p => p.tableId === table._id);

    if (isActiveInTable) {
      setMatch(activeMatch);
      setDisplayState('timer');
    } else {
      const loadedMatch = matches.find(m => m._id === divisionState.loadedMatch);
      const loadedMatchParticipant = loadedMatch?.participants
        .filter(p => p.teamId)
        .find(p => p.tableId === table._id);
      const completedMatches = matches
        .filter(m => m.participants.some(p => p.tableId === table._id && p.teamId))
        .filter(m => m.status === 'completed');
      const lastCompletedMatch = completedMatches[completedMatches.length - 1];

      if (lastCompletedMatch) {
        // Check if no show
        const lastCompletedMatchParticipant = lastCompletedMatch.participants
          .filter(p => p.teamId)
          .find(p => p.tableId === table._id);
        if (lastCompletedMatchParticipant?.present === 'no-show') {
          setMatch(loadedMatch);
          setDisplayState(loadedMatchParticipant ? 'prestart' : 'no-match');
        } else {
          // Check if we finished doing the scoresheet of the last completed match
          getScoresheet(lastCompletedMatch).then(scoresheet => {
            if (
              lastCompletedMatchParticipant &&
              scoresheet.status !== 'ready' &&
              !scoresheet.escalated
            ) {
              toScoresheet(lastCompletedMatchParticipant, scoresheet);
            } else {
              setMatch(loadedMatch);
              setDisplayState(loadedMatchParticipant ? 'prestart' : 'no-match');
            }
          });
        }
      } else if (loadedMatchParticipant) {
        setMatch(loadedMatch);
        setDisplayState('prestart');
      } else {
        setMatch(undefined);
        setDisplayState('no-match');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionState, matches, table._id, division._id, router, participant?.team?._id]);

  return (
    <>
      {participant &&
        match &&
        displayState === 'prestart' &&
        (participant.ready ? (
          <WaitForMatchStart
            participant={participant}
            match={match}
            updateMatchParticipant={updateMatchParticipant}
          />
        ) : (
          <MatchPrestart
            participant={participant}
            match={match}
            updateMatchParticipant={updateMatchParticipant}
            inspectionStatus={prestartInspection}
            updateInspectionStatus={setPrestartInspection}
          />
        ))}
      {participant && match && displayState === 'timer' && (
        <Timer
          participant={participant}
          match={match}
          getScoresheet={getScoresheet}
          toScoresheet={toScoresheet}
        />
      )}
      {displayState === 'no-match' && (
        <Stack spacing={4} sx={{ mt: 4 }}>
          <NoMatchCard />
          <TableSchedule matches={matches} table={table} teams={teams} limit={5} />
        </Stack>
      )}
    </>
  );
};

export default StrictRefereeDisplay;
