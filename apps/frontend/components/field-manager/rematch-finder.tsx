import { WithId } from 'mongodb';
import { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Stack,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Select,
  MenuItem,
  IconButton,
  Divider
} from '@mui/material';
import { blue } from '@mui/material/colors';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import {
  DivisionState,
  JUDGING_SESSION_LENGTH,
  JudgingSession,
  JudgingRoom,
  RobotGameMatch,
  Team,
  RobotGameMatchParticipant,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import TeamSelection from '../general/team-selection';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';

interface RematchData {
  categoryOne: {
    match: string;
    participant: string;
  };
  categoryTwo: {
    session: string;
    match: string;
    participant: string;
  };
}

interface RematchOptionsProps {
  teams: Array<WithId<Team>>;
  rematchTeam: WithId<Team>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const RematchOptions: React.FC<RematchOptionsProps> = ({
  teams,
  rematchTeam,
  divisionState,
  matches,
  sessions,
  rooms,
  socket
}) => {
  const unregisteredTeamIds = teams.filter(t => !t.registered).map(t => t._id);
  const judgingTime = sessions.find(session => session.teamId === rematchTeam._id)?.scheduledTime;

  const initialRematchData = {
    categoryOne: {
      match: '',
      participant: ''
    },
    categoryTwo: {
      session: '',
      match: '',
      participant: ''
    }
  };
  const [rematchData, setRematchData] = useState<RematchData>({ ...initialRematchData });

  const handleSubmit = (matchId: string, participantIndexAsString: string, sessionId?: string) => {
    const match = matches.find(m => m._id.toString() === matchId);
    const participantIndex = Number(participantIndexAsString);
    const session = sessionId ? sessions.find(s => s._id.toString() === sessionId) : null;

    if (!match) return;

    const newMatchParticipants = match.participants.map((participant, index) => {
      const { tableId, teamId } = participant;
      return { tableId, teamId: index === participantIndex ? rematchTeam._id : teamId };
    }) as Array<Partial<RobotGameMatchParticipant>>;

    socket.emit(
      'updateMatchTeams',
      match.divisionId.toString(),
      match._id.toString(),
      newMatchParticipants,
      response => {
        if (response.ok) {
          enqueueSnackbar('המקצה עודכן בהצלחה!', { variant: 'success' });
        } else {
          enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
        }
      }
    );

    if (session) {
      socket.emit(
        'updateJudgingSessionTeam',
        session.divisionId.toString(),
        session._id.toString(),
        rematchTeam._id.toString(),
        response => {
          if (response.ok) {
            enqueueSnackbar('מפגש השיפוט עודכן בהצלחה!', { variant: 'success' });
          } else {
            enqueueSnackbar('אופס, עדכון מפגש השיפוט נכשל.', { variant: 'error' });
          }
        }
      );
    }

    setRematchData({ ...initialRematchData });
  };

  /**
   * Crude implementation for detection of staggered matches.
   * We assume the first match is always filled to the brim, and staggering means 50% of tables are empty..
   */
  const matchStaggering = useMemo(() => {
    const firstMatch = matches.find(m => m.number === 1);
    if (!firstMatch) return null; // Should never happen
    if (
      firstMatch.participants.filter(p => p.teamId === null).length >=
      firstMatch.participants.length / 2
    )
      return true;
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Crude implemenation for finding the match cycle time for the current round.
   * Assumes the first two matches are consecutive with no breaks.
   */
  const matchCycleTime = useMemo(() => {
    const roundMatches = matches
      .filter(m => m.round === divisionState.currentRound)
      .sort((a, b) => dayjs(a.scheduledTime).diff(dayjs(b.scheduledTime))); // TODO: might need to flip
    const firstMatch = roundMatches[0];
    const secondMatch = roundMatches[1];
    if (!firstMatch || !secondMatch) return 0; // Should never happen
    return dayjs(secondMatch.scheduledTime).diff(dayjs(firstMatch.scheduledTime), 'seconds');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionState.currentRound]);

  /**
   * Return true if:
   * Match starts less than 15 minutes before judging starts (Team won't make it to session)
   * AND Match starts less than 10 minutes after judging ends. (Team won't make it to match)
   */
  const judgingInterference = (judgingStart: Dayjs, ...matchStarts: Dayjs[]) => {
    const judgingEnd = judgingStart.add(JUDGING_SESSION_LENGTH, 'seconds');
    return matchStarts.some(
      matchStart =>
        matchStart.isAfter(judgingStart.subtract(15, 'minutes')) &&
        matchStart.isBefore(judgingEnd.add(10, 'minutes'))
    );
  };

  /**
   * Finds all the participants in a match which are either empty or have an unregistered team.
   * For each participant, return whether the fit is tight or not, in case of staggering.
   * Tight in this case means that the team is slotted between two consecutive staggered matches, which halves the cycle time.
   */
  const getAvailableParticipants = (match: WithId<RobotGameMatch>) => {
    let nextMatch =
      matches.find(m => m.number === match.number + 1 && m.round === match.round) ?? null;
    if (
      nextMatch &&
      dayjs(nextMatch.scheduledTime).diff(dayjs(match.scheduledTime)) > matchCycleTime
    ) {
      nextMatch = null; // Next match is not consecutive
    }

    const availableSlots = match.participants
      .map((participant, index) => {
        if (participant.teamId && !unregisteredTeamIds.includes(participant.teamId)) return null;

        let tight = false;
        if (
          matchStaggering &&
          nextMatch &&
          nextMatch.participants[index].teamId &&
          !unregisteredTeamIds.includes(nextMatch.participants[index].teamId)
        ) {
          tight = true;
        }

        return { index, tight };
      })
      .filter(element => element !== null)
      .sort((a, b) => (a === b ? 0 : a ? 1 : -1)); // Non-tight first

    return availableSlots;
  };

  const teamMatchTimes = matches
    .filter(match => !!match.participants.find(p => p.teamId === rematchTeam._id))
    .map(match => dayjs(match.scheduledTime));

  /**
   * Matches containing at least one table with a null team or an unregistered team,
   * and the rematch team is not already participating in the match.
   */
  const availableMatches = matches.filter(
    match =>
      match.stage === 'ranking' &&
      match.round === divisionState.currentRound &&
      match.status === 'not-started' &&
      !match.participants.find(p => p.teamId === rematchTeam._id) &&
      match.participants.find(p => p.teamId === null || unregisteredTeamIds.includes(p.teamId))
  );

  /**
   * Judging sessions that have a null or unregistered team,
   * and do not interfere with the rematch team's matches.
   */
  const availableJudgingSlots = sessions.filter(
    session =>
      (session.teamId === null || unregisteredTeamIds.includes(session.teamId)) &&
      !judgingInterference(dayjs(judgingTime), ...teamMatchTimes)
  );

  /**
   * Category 1, move match: Match participants that are either empty or have a null team,
   * that do not interfere with the rematch team's judging session.
   */
  const categoryOne = availableMatches
    .filter(match => !judgingInterference(dayjs(judgingTime), dayjs(match.scheduledTime)))
    .map(match => {
      const participants = getAvailableParticipants(match);
      return { match, participants };
    });

  /**
   * Category 2, move match and judging: Match slots (table in match) that are either empty or have a null team,
   * and will not interfere if the team's judging moves to an available judging slot (null or unregistered).
   */
  const categoryTwo = availableJudgingSlots.map(session => {
    const _matches = availableMatches.filter(
      match => !judgingInterference(dayjs(session.scheduledTime), dayjs(match.scheduledTime))
    );

    const matchesWithParticipants = _matches.map(match => {
      const participants = getAvailableParticipants(match);
      return { match, participants };
    });

    return { session, matches: matchesWithParticipants };
  });

  if (!judgingTime) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>לא נמצא זמן שיפוט לקבוצה</Typography>
      </Paper>
    );
  }

  if (categoryOne.length === 0 && categoryTwo.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>לא מצאנו אפשרות להעניק לקבוצה מקצה חוזר במסגרת לוח הזמנים.</Typography>
        <Typography>ניתן לקיים מקצה חוזר מחוץ ללוח הזמנים באופן הבא:</Typography>
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[400], height: 36, width: 36, color: '#fff' }}>1</Avatar>
            </ListItemAvatar>
            <ListItemText>
              הנחו את אחד משופטי הזירה לפתוח את דף הניקוד של הקבוצה בסבב האחרון ולאפס אותו.
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[400], height: 36, width: 36, color: '#fff' }}>2</Avatar>
            </ListItemAvatar>
            <ListItemText>הפעילו מקצה בדיקה באמצעות ממשק ה-Scorekeeper.</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[400], height: 36, width: 36, color: '#fff' }}>3</Avatar>
            </ListItemAvatar>
            <ListItemText>נקדו את תוצאות המקצה בהתאם. </ListItemText>
          </ListItem>
        </List>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: blue[400], height: 36, width: 36, color: '#fff' }}>1</Avatar>
          <Typography>קבעו מקצה חוזר בשעה</Typography>
          <Select
            value={rematchData.categoryOne.match}
            onChange={e =>
              setRematchData(data => ({
                ...data,
                categoryOne: { match: e.target.value, participant: '' }
              }))
            }
            variant="standard"
            autoWidth
            sx={{ minWidth: 100 }}
          >
            {categoryOne.map(x => (
              <MenuItem key={x.match._id.toString()} value={String(x.match._id)}>
                {dayjs(x.match.scheduledTime).format('HH:mm')}
              </MenuItem>
            ))}
          </Select>
          {rematchData.categoryOne.match !== '' && (
            <>
              <Typography>בשולחן</Typography>
              <Select
                value={rematchData.categoryOne.participant}
                onChange={e =>
                  setRematchData(data => ({
                    ...data,
                    categoryOne: {
                      match: data.categoryOne.match,
                      participant: e.target.value
                    }
                  }))
                }
                variant="standard"
                autoWidth
                sx={{ minWidth: 100 }}
              >
                {categoryOne
                  .find(x => x.match._id.toString() === rematchData.categoryOne.match)
                  ?.participants.map(p => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const _match = categoryOne.find(
                      x => x.match._id.toString() === rematchData.categoryOne.match
                    )!.match;

                    return (
                      <MenuItem key={p.index} value={p.index}>
                        {_match.participants[p.index].tableName}
                      </MenuItem>
                    );
                  })}
              </Select>
              {rematchData.categoryOne.match !== '' &&
                rematchData.categoryOne.participant !== null && (
                  <IconButton
                    onClick={() =>
                      handleSubmit(
                        rematchData.categoryOne.match,
                        rematchData.categoryOne.participant
                      )
                    }
                  >
                    <RocketLaunchRoundedIcon />
                  </IconButton>
                )}
            </>
          )}
        </Stack>
        <Divider />
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: blue[400], height: 36, width: 36, color: '#fff' }}>2</Avatar>
          <Typography>הזיזו את מקצה השיפוט לשעה</Typography>
          <Select
            value={rematchData.categoryTwo.session}
            onChange={e =>
              setRematchData(data => ({
                ...data,
                categoryTwo: { session: e.target.value, match: '', participant: '' }
              }))
            }
            variant="standard"
            autoWidth
            sx={{ minWidth: 100 }}
          >
            {categoryTwo.map(x => (
              <MenuItem key={x.session._id.toString()} value={String(x.session._id)}>
                {dayjs(x.session.scheduledTime).format('HH:mm')}
              </MenuItem>
            ))}
          </Select>
          {rematchData.categoryTwo.session !== '' && (
            <Typography>
              בחדר{' '}
              {
                rooms.find(
                  r =>
                    r._id ===
                    categoryTwo.find(
                      x => x.session._id.toString() === rematchData.categoryTwo.session
                    )?.session.roomId
                )?.name
              }{' '}
            </Typography>
          )}
        </Stack>

        {rematchData.categoryTwo.session !== '' && (
          <Stack direction="row" spacing={2} alignItems="center" pl={6.5}>
            <Typography>וקבעו מקצה חוזר בשעה</Typography>
            <Select
              value={rematchData.categoryTwo.match}
              onChange={e =>
                setRematchData(data => ({
                  ...data,
                  categoryTwo: {
                    session: data.categoryTwo.session,
                    match: e.target.value,
                    participant: ''
                  }
                }))
              }
              variant="standard"
              autoWidth
              sx={{ minWidth: 100 }}
            >
              {categoryTwo
                .find(x => String(x.session._id) === rematchData.categoryTwo.session)
                ?.matches.map(x => (
                  <MenuItem key={x.match._id.toString()} value={String(x.match._id)}>
                    {dayjs(x.match.scheduledTime).format('HH:mm')}
                  </MenuItem>
                ))}
            </Select>
            {rematchData.categoryTwo.match !== '' && (
              <>
                <Typography>בשולחן</Typography>
                <Select
                  value={rematchData.categoryTwo.participant}
                  onChange={e =>
                    setRematchData(data => ({
                      ...data,
                      categoryTwo: {
                        session: data.categoryTwo.session,
                        match: data.categoryTwo.match,
                        participant: e.target.value
                      }
                    }))
                  }
                  variant="standard"
                  autoWidth
                  sx={{ minWidth: 100 }}
                >
                  {categoryTwo
                    .find(x => String(x.session._id) === rematchData.categoryTwo.session)
                    ?.matches.find(x => x.match._id.toString() === rematchData.categoryTwo.match)
                    ?.participants.map(p => {
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      const _match = categoryTwo
                        .find(x => String(x.session._id) === rematchData.categoryTwo.session)!
                        .matches.find(
                          x => x.match._id.toString() === rematchData.categoryTwo.match
                        )!.match;

                      return (
                        <MenuItem key={p.index} value={p.index}>
                          {_match.participants[p.index].tableName}
                        </MenuItem>
                      );
                    })}
                </Select>
                {rematchData.categoryTwo.session !== '' &&
                  rematchData.categoryTwo.match !== '' &&
                  rematchData.categoryTwo.participant !== '' && (
                    <IconButton
                      onClick={() =>
                        handleSubmit(
                          rematchData.categoryTwo.match,
                          rematchData.categoryTwo.participant,
                          rematchData.categoryTwo.session
                        )
                      }
                    >
                      <RocketLaunchRoundedIcon />
                    </IconButton>
                  )}
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

interface RematchFinderProps {
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  divisionState: WithId<DivisionState>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const RematchFinder: React.FC<RematchFinderProps> = ({
  teams,
  matches,
  rooms,
  sessions,
  divisionState,
  socket
}) => {
  const [rematchTeam, setRematchTeam] = useState<WithId<Team> | null>(null);

  if (divisionState.currentStage !== 'ranking') {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h2" gutterBottom>
          הענקת מקצה חוזר
        </Typography>
        <Typography>לא ניתן להעניק מקצה חוזר בשלב האימונים.</Typography>
      </Paper>
    );
  }

  return (
    <Stack sx={{ mt: 2 }} spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h2" mb={3}>
          הענקת מקצה חוזר
        </Typography>
        <TeamSelection setTeam={setRematchTeam} teams={teams} value={rematchTeam} />
      </Paper>
      {rematchTeam && (
        <RematchOptions
          rooms={rooms}
          teams={teams}
          rematchTeam={rematchTeam}
          divisionState={divisionState}
          matches={matches}
          sessions={sessions}
          socket={socket}
        />
      )}
    </Stack>
  );
};

export default RematchFinder;
