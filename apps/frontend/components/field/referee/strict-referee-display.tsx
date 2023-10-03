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
import NoMatchCard from './no-match-card';
import Timer from './timer';
import { apiFetch } from '../../../lib/utils/fetch';

type StrictRefereeDisplayState = 'timer' | 'prestart' | 'no-match' | undefined;

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
    (updatedMatchParticipant: Partial<Pick<RobotGameMatchParticipant, 'present' | 'ready'>>) => {
      if (!match || !participant) return;
      socket.emit(
        'prestartMatchParticipant',
        match.eventId.toString(),
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

  useEffect(() => {
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
      const completedMatchParticipant = lastCompletedMatch?.participants.find(
        p => p.tableId === table._id
      );

      if (lastCompletedMatch) {
        // Check if we finished doing the scoresheet of the last completed match
        getScoresheet(lastCompletedMatch._id).then(scoresheet => {
          if (scoresheet.status !== 'waiting-for-head-ref' && scoresheet.status !== 'ready') {
            router.push(
              `/event/${event._id}/team/${completedMatchParticipant?.team?._id}/scoresheet/${scoresheet._id}`
            );
          } else {
            setMatch(loadedMatch);
            setDisplayState(loadedMatch ? 'prestart' : 'no-match');
          }
        });
      } else if (loadedMatch) {
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
          />
        ))}
      {participant && match && displayState === 'timer' && (
        <Timer participant={participant} match={match} />
      )}
      {displayState === 'no-match' && <NoMatchCard />}
    </>
  );
};

export default StrictRefereeDisplay;
