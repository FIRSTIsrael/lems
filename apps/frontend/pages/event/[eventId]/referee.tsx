import { useState, useMemo, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { Avatar, Box, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import {
  Event,
  Team,
  JudgingSession,
  SafeUser,
  Scoresheet,
  RobotGameMatch,
  RobotGameTable,
  EventState,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizeTeam } from '../../../localization/teams';
import dayjs from 'dayjs';
import { Socket } from 'socket.io-client';

interface ReadyCheckProps {
  team: Team;
  match: WithId<RobotGameMatch>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ReadyCheck: React.FC<ReadyCheckProps> = ({ team, match, socket }) => {
  const handleReadyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      match &&
        socket.emit('changeMatchStatus', match._id.toString(), e.target.checked, response => {
          // { ok: true }
        });
    },
    [match, socket]
  );

  return (
    <Paper sx={{ mt: 4, p: 4 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h1">{localizeTeam(team)}</Typography>
        <Typography variant="h3" fontSize="2rem" color="gray">
          המקצה הבא יתחיל בשעה {dayjs(match.time).format('HH:mm')}
        </Typography>
        <FormControlLabel
          control={<Checkbox checked={match.ready} onChange={handleReadyChange} />}
          label={<Typography variant="h4">הקבוצה ואנחנו מוכנים למקצה!</Typography>}
          sx={{ '& .MuiSvgIcon-root': { fontSize: 35 } }}
        />
      </Stack>
    </Paper>
  );
};

type RefereePageStatus = 'timer' | 'readyCheck' | 'scoring' | 'done' | undefined;

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
}

const Page: NextPage<Props> = ({ user, event, table }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState | undefined>(undefined);
  const [team, setTeam] = useState<WithId<Team> | undefined>(undefined);
  const [scoresheet, setScoresheet] = useState<WithId<Scoresheet> | undefined>(undefined);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>> | undefined>(undefined);
  const [match, setMatch] = useState<WithId<RobotGameMatch> | undefined>(undefined);

  const updateEventState = () => {
    apiFetch(`/api/events/${user.event}/state`)
      .then(res => res?.json())
      .then(data => setEventState(data));
  };

  const updateMatches = () => {
    return apiFetch(`/api/events/${user.event}/tables/${table._id}/matches`)
      .then(res => res?.json())
      .then(data => setMatches(data));
  };

  const getData = () => {
    updateEventState();
    updateMatches();
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field', 'pit-admin'],
    getData,
    [
      //Should be onMatchUpdate function that gets a matchID as a parameter.
      //if match is in matches array, update event state and matches, if not only event state
      { name: 'matchStarted', handler: getData },
      { name: 'matchCompleted', handler: getData },
      { name: 'matchAborted', handler: getData },
      // This should have a handler that gets a teamID. if the teamID is the current team,
      // update it. if not then do nothing.
      // The registration status should be passed on to the scoresheet as a prop.
      { name: 'teamRegistered', handler: getData },
      // This should have a handler that gets scoresheetID. If this is our scoresheet, update it.
      // If not, do nothing.
      { name: 'scoresheetUpdated', handler: getData },
      // Why do we need this? If its for a ref ready thing then use a general matchUpdate and delete this event.
      { name: 'matchStatusChanged', handler: updateMatches }
    ]
  );

  const pageState: RefereePageStatus = useMemo(() => {
    const updateTeam = (teamId: ObjectId | undefined) => {
      teamId &&
        apiFetch(`/api/events/${user.event}/teams/${teamId}`)
          .then(res => res.json())
          .then(team => setTeam(team));
    };

    const getScoresheet = (matchId: ObjectId | undefined) => {
      return apiFetch(
        `/api/events/${user.event}/tables/${table._id}/matches/${matchId}/scoresheet`
      ).then(res => res.json());
    };

    const handleScoringState = (match: WithId<RobotGameMatch>): RefereePageStatus => {
      if (matches && eventState) {
        getScoresheet(match._id).then((data: WithId<Scoresheet>) => {
          if (data.status !== 'completed') {
            // Scoring in progress
            updateTeam(match.team);
            setScoresheet(data);
            return 'scoring';
          } else {
            // Scoring has already been completed
            const nextMatch = matches.find(m => m.number > eventState.activeMatch);
            if (nextMatch) {
              // Get ready for next match
              setMatch(nextMatch);
              updateTeam(nextMatch.team);
              return 'readyCheck';
            } else {
              // All matches in the event have been completed on this table
              setMatch(undefined);
              return 'done';
            }
          }
        });
      }
      return undefined;
    };

    if (eventState && matches) {
      const activeMatch = matches.find(match => match.number === eventState.activeMatch);
      if (activeMatch) {
        // Our table is currently participating in the active match
        setMatch(activeMatch);
        if (activeMatch.status === 'in-progress')
          return 'timer'; // Wait for completion before scoring
        else {
          // Active match is completed
          return handleScoringState(activeMatch);
        }
      } else {
        // Our table is not participating in the active match.
        const previousMatch = matches.find(match => match.number < eventState.activeMatch);
        if (previousMatch) {
          setMatch(previousMatch);
          return handleScoringState(previousMatch);
        } else {
          // Our table has not had a match yet. Display first match.
          setMatch(matches[0]);
          getScoresheet(matches[0]._id).then((data: WithId<Scoresheet>) => setScoresheet(data));
          updateTeam(matches[0].team);
          return 'readyCheck';
        }
      }
    }
  }, [eventState, matches, user.event, table._id]);

  return (
    <RoleAuthorizer user={user} allowedRoles="referee" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        {team && match && scoresheet && pageState === 'readyCheck' && (
          <ReadyCheck team={team} match={match} socket={socket} />
        )}
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    const tablePromise = apiFetch(
      `/api/events/${user.event}/tables/${user.roleAssociation.value}`,
      undefined,
      ctx
    ).then(res => res?.json());
    const [table, event] = await Promise.all([tablePromise, eventPromise]);

    return { props: { user, event, table } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
