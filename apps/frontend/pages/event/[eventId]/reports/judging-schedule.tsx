import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Event,
  Team,
  JudgingRoom,
  SafeUser,
  JudgingSession,
  RoleTypes,
  JUDGING_SESSION_LENGTH,
  EventScheduleEntry
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';
import StyledTeamTooltip from '../../../../components/general/styled-team-tooltip';

interface JudgingScheduleRowProps {
  number: number;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
}

const JudgingScheduleRow: React.FC<JudgingScheduleRowProps> = ({
  number,
  sessions,
  rooms,
  teams
}) => {
  const startTime = dayjs(sessions.find(s => s.number === number)?.time);

  return (
    <TableRow>
      <TableCell>{startTime.format('HH:mm')}</TableCell>
      <TableCell>{startTime.add(JUDGING_SESSION_LENGTH, 'seconds').format('HH:mm')}</TableCell>
      {rooms.map(r => {
        const team = teams.find(
          t => t._id === sessions.find(s => s.number === number && s.room === r._id)?.team
        );

        return (
          team && (
            <TableCell key={r._id.toString()} align="center">
              <StyledTeamTooltip team={team} />
            </TableCell>
          )
        );
      })}
    </TableRow>
  );
};

interface GeneralScheduleRowProps {
  schedule: EventScheduleEntry;
  colSpan: number;
}

const GeneralScheduleRow: React.FC<GeneralScheduleRowProps> = ({ schedule, colSpan }) => {
  return (
    <TableRow>
      <TableCell>{dayjs(schedule.startTime).format('HH:mm')}</TableCell>
      <TableCell>{dayjs(schedule.endTime).format('HH:mm')}</TableCell>
      <TableCell colSpan={colSpan} sx={{ textAlign: 'center' }}>
        {schedule.name}
      </TableCell>
    </TableRow>
  );
};

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
}

const Page: NextPage<Props> = ({ user, event, teams: initialTeams, rooms, sessions }) => {
  const router = useRouter();
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);

  const judgesGeneralSchedule = event.schedule?.filter(s => s.roles.includes('judge')) || [];

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        } else {
          return t;
        }
      })
    );
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['pit-admin'], undefined, [
    { name: 'teamRegistered', handler: handleTeamRegistered }
  ]);

  return (
    <RoleAuthorizer user={user} allowedRoles={[...RoleTypes]} onFail={() => router.back()}>
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - לו״ז שיפוט | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/reports`}
        backDisabled={connectionStatus !== 'connecting'}
      >
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>התחלה</TableCell>
                <TableCell>סיום</TableCell>
                {rooms.map(room => (
                  <TableCell key={room._id.toString()} align="center">
                    {`חדר ${room.name}`}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {showGeneralSchedule &&
                judgesGeneralSchedule
                  .filter(s => {
                    const firstSession = Math.min(...sessions.flatMap(s => s.number));
                    const firstSessionTime = dayjs(
                      sessions.find(s => s.number === firstSession)?.time
                    );

                    return dayjs(s.startTime).isBefore(firstSessionTime);
                  })
                  .map(rs => (
                    <GeneralScheduleRow key={rs.name} schedule={rs} colSpan={rooms.length} />
                  ))}
              {[...new Set(sessions.flatMap(s => s.number))].map(row => {
                const rowTime = dayjs(sessions.find(s => s.number === row)?.time);
                const prevRowTime = dayjs(sessions.find(s => s.number === row - 1)?.time);
                const rowSchedule =
                  judgesGeneralSchedule.filter(
                    p =>
                      dayjs(p.startTime).isBefore(rowTime) &&
                      dayjs(p.startTime).isAfter(prevRowTime)
                  ) || [];

                return (
                  <>
                    {showGeneralSchedule &&
                      rowSchedule.map(rs => (
                        <GeneralScheduleRow key={rs.name} schedule={rs} colSpan={rooms.length} />
                      ))}
                    <JudgingScheduleRow
                      key={row}
                      number={row}
                      teams={teams}
                      sessions={sessions}
                      rooms={rooms}
                    />
                  </>
                );
              })}
              {showGeneralSchedule &&
                judgesGeneralSchedule
                  .filter(s => {
                    const lastSession = Math.max(...sessions.flatMap(s => s.number));
                    const lastSessionTime = dayjs(
                      sessions.find(s => s.number === lastSession)?.time
                    );

                    return dayjs(s.startTime).isAfter(lastSessionTime);
                  })
                  .map(rs => (
                    <GeneralScheduleRow key={rs.name} schedule={rs} colSpan={rooms.length} />
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <FormControlLabel
          sx={{ mt: 2 }}
          control={
            <Switch
              checked={showGeneralSchedule}
              onChange={event => {
                setShowGeneralSchedule(event.target.checked);
              }}
            />
          }
          label="הצג אירועים כלליים"
        />
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.event}?withSchedule=true`,
        teams: `/api/events/${user.event}/teams`,
        rooms: `/api/events/${user.event}/rooms`,
        sessions: `/api/events/${user.event}/sessions`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
