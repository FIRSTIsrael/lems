import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ObjectId, WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import {
  Event,
  EventState,
  RobotGameMatch,
  RobotGameMatchParticipant,
  RobotGameTable,
  Scoresheet,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import WaitForMatchStart from './wait-for-start';
import MatchPrestart from './prestart';
import DoneCard from './done-card';
import Timer from './timer';
import { apiFetch } from '../../../lib/utils/fetch';

type StrictRefereeDisplayState =
  | 'timer'
  | 'prestart'
  | 'waiting-for-start'
  | 'no-match'
  | undefined;

interface MatchPrestartProps {
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const StrictRefereeDisplay: React.FC<MatchPrestartProps> = ({
  event,
  table,
  eventState,
  matches,
  socket
}) => {
  const router = useRouter();
  const [displayState, setDisplayState] = useState<StrictRefereeDisplayState>(undefined);
  const [match, setMatch] = useState<WithId<RobotGameMatch> | undefined>(undefined);

  const participant = useMemo(
    () => match?.participants.find(p => p.tableId === table._id),
    [match?.participants, table._id]
  );

  const updateMatchParticipant = useCallback(
    (updatedMatchParticipant: Partial<RobotGameMatchParticipant>) => {
      if (match) {
        const participantIndex = match.participants.findIndex(p => p.tableId === table._id);
        if (participantIndex !== -1) {
          const updatedMatch = { ...match };
          updatedMatch.participants[participantIndex] = {
            ...updatedMatch.participants[participantIndex],
            ...updatedMatchParticipant
          };
          socket.emit(
            'updateMatch',
            match.eventId.toString(),
            match._id.toString(),
            updatedMatch,
            response => {
              if (!response.ok) {
                enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
              }
            }
          );
        }
      }
    },
    [match, socket, table._id]
  );

  useEffect(() => {
    // if active match and we are in active match
    // timer

    // get our table's highest match that has been completed
    // did we finished doing the scoresheet
    // if not then scoresheet
    // if we did - loaded match?
    // yes - prestart
    // no - no-match

    const getScoresheet = (matchId: ObjectId) => {
      return apiFetch(
        `/api/events/${event._id}/tables/${table._id}/matches/${matchId}/scoresheet`
      ).then<WithId<Scoresheet>>(res => res.json());
    };

    const activeMatch = matches.find(m => m._id === eventState.activeMatch);
    const isActiveInTable = !!activeMatch?.participants.find(p => p.tableId === table._id);

    if (isActiveInTable) {
      setMatch(activeMatch);
      setDisplayState('timer');
    } else {
      const loadedMatch = matches.find(m => m._id === eventState.loadedMatch);
      const completedMatches = matches.filter(m => m.status === 'completed');
      const lastCompletedMatch = completedMatches[completedMatches.length - 1];

      if (lastCompletedMatch) {
        // Check if we finished doing the scoresheet of the last completed match
        getScoresheet(lastCompletedMatch._id).then(scoresheet => {
          if (scoresheet.status !== 'waiting-for-head-ref' && scoresheet.status !== 'ready') {
            router.push(
              `/event/${event._id}/team/${participant?.team?._id}/scoresheet/${scoresheet._id}`
            );
          } else {
            setMatch(loadedMatch);
            setDisplayState(loadedMatch ? 'prestart' : 'no-match');
          }
        });
      } else if (eventState.loadedMatch) {
        setMatch(loadedMatch);
        setDisplayState('prestart');
      } else {
        setMatch(undefined);
        setDisplayState('no-match');
      }
    }
  }, [eventState, matches, table._id, event._id, router, participant?.team?._id]);

  return (
    <>
      {participant && match && displayState === 'prestart' && (
        <MatchPrestart
          participant={participant}
          match={match}
          updateMatchParticipant={updateMatchParticipant}
        />
      )}
      {participant && match && displayState === 'waiting-for-start' && (
        <WaitForMatchStart
          participant={participant}
          match={match}
          updateMatchParticipant={updateMatchParticipant}
        />
      )}
      {participant && match && displayState === 'timer' && (
        <Timer participant={participant} match={match} />
      )}
      {displayState === 'no-match' && <DoneCard />}
    </>
  );
};

export default StrictRefereeDisplay;
