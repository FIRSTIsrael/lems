import { useState, useMemo } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { TabContext, TabPanel } from '@mui/lab';
import { Paper, Tabs, Tab, Stack } from '@mui/material';
import {
  CoreValuesForm,
  Division,
  DivisionState,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Team,
  Ticket,
  RobotGameTable,
  RobotGameMatch
} from '@lems/types';
import Layout from '../../../components/layout';
import ReportLink from '../../../components/general/report-link';
import InsightsLink from '../../../components/general/insights-link';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import TicketPanel from '../../../components/general/ticket-panel';
import DivisionPanel from '../../../components/tournament-manager/division-panel';
import JudgingScheduleEditor from '../../../components/tournament-manager/judging-schedule-editor';
import FieldScheduleEditor from '../../../components/tournament-manager/field-schedule-editor';
import ConnectionIndicator from '../../../components/connection-indicator';
import CVPanel from '../../../components/cv-form/cv-panel';
import BadgeTab from '../../../components/general/badge-tab';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizedRoles } from '../../../localization/roles';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
  tickets: Array<WithId<Ticket>>;
  rooms: Array<WithId<JudgingRoom>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  cvForms: Array<WithId<CoreValuesForm>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  teams: initialTeams,
  tickets: initialTickets,
  rooms,
  tables,
  matches: initialMatches,
  sessions: initialSessions,
  cvForms: initialCvForms
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('1');
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [tickets, setTickets] = useState<Array<WithId<Ticket>>>(initialTickets);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [cvForms, setCvForms] = useState<Array<WithId<CoreValuesForm>>>(initialCvForms);

  const openCVForms = useMemo(
    () => cvForms.filter(cvForm => !cvForm.actionTaken).length,
    [cvForms]
  );

  const openTickets = useMemo(() => tickets.filter(t => !t.closed).length, [tickets]);

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

  const handleTicketCreated = (ticket: WithId<Ticket>) => {
    setTickets(tickets => [...tickets, ticket]);
  };

  const handleTicketUpdated = (ticket: WithId<Ticket>) => {
    setTickets(tickets =>
      tickets.map(t => {
        if (t._id === ticket._id) {
          return ticket;
        } else {
          return t;
        }
      })
    );
  };

  const handleSessionDivision = (session: WithId<JudgingSession>) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );
  };

  const handleMatchDivision = (
    newMatch: WithId<RobotGameMatch>,
    newDivisionState?: WithId<DivisionState>
  ) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === newMatch._id) {
          return newMatch;
        }
        return m;
      })
    );
    if (newDivisionState) setDivisionState(newDivisionState);
  };

  const handleCvFormCreated = (cvForm: WithId<CoreValuesForm>) => {
    setCvForms(cvForms => [...cvForms, cvForm]);
  };

  const handleCvFormUpdated = (cvForm: WithId<CoreValuesForm>) => {
    setCvForms(cvForms =>
      cvForms.map(f => {
        if (f._id === cvForm._id) return cvForm;
        return f;
      })
    );
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['pit-admin', 'field', 'judging'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'judgingSessionStarted', handler: handleSessionDivision },
      { name: 'judgingSessionCompleted', handler: handleSessionDivision },
      { name: 'judgingSessionAborted', handler: handleSessionDivision },
      { name: 'judgingSessionUpdated', handler: handleSessionDivision },
      { name: 'matchLoaded', handler: handleMatchDivision },
      { name: 'matchStarted', handler: handleMatchDivision },
      { name: 'matchCompleted', handler: handleMatchDivision },
      { name: 'matchAborted', handler: handleMatchDivision },
      { name: 'matchUpdated', handler: handleMatchDivision },
      {
        name: 'cvFormCreated',
        handler: cvForm => {
          handleCvFormCreated(cvForm);
          enqueueSnackbar('נוצר טופס ערכי ליבה חדש!', {
            variant: 'warning',
            persist: true,
            preventDuplicate: true
          });
        }
      },
      {
        name: 'cvFormUpdated',
        handler: cvForm => {
          handleCvFormUpdated(cvForm);
          enqueueSnackbar('עודכן טופס ערכי ליבה!', { variant: 'info' });
        }
      },
      {
        name: 'ticketCreated',
        handler: ticket => {
          handleTicketCreated(ticket);
          enqueueSnackbar('נוצרה קריאה חדשה!', {
            variant: 'warning',
            persist: true,
            preventDuplicate: true
          });
        }
      },
      {
        name: 'ticketUpdated',
        handler: ticket => {
          handleTicketUpdated(ticket);
          enqueueSnackbar('עודכנה קריאה!', { variant: 'info' });
        }
      }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="tournament-manager"
      onFail={() => {
        router.push(`/division/${division._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            {divisionState.completed ? (
              <InsightsLink division={division} />
            ) : (
              <ReportLink division={division} />
            )}
          </Stack>
        }
        color={division.color}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <BadgeTab label="קריאות" showBadge={openTickets > 0} value="1" />
              <Tab label="אירוע" value="2" />
              <Tab label="זירה" value="3" />
              <Tab label="שיפוט" value="4" />
              <BadgeTab label="טפסי CV" showBadge={openCVForms > 0} value="5" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <TicketPanel division={division} teams={teams} tickets={tickets} socket={socket} />
          </TabPanel>
          <TabPanel value="2">
            <DivisionPanel division={division} divisionState={divisionState} />
          </TabPanel>
          <TabPanel value="3">
            <FieldScheduleEditor
              division={division}
              divisionState={divisionState}
              teams={teams}
              tables={tables}
              matches={matches}
              socket={socket}
            />
          </TabPanel>
          <TabPanel value="4">
            <JudgingScheduleEditor
              division={division}
              teams={teams}
              rooms={rooms}
              sessions={sessions}
              socket={socket}
            />
          </TabPanel>
          <TabPanel value="5">
            <CVPanel user={user} cvForms={cvForms} division={division} socket={socket} />
          </TabPanel>
        </TabContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${user.divisionId}`,
        divisionState: `/api/divisions/${user.divisionId}/state`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        tickets: `/api/divisions/${user.divisionId}/tickets`,
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        tables: `/api/divisions/${user.divisionId}/tables`,
        matches: `/api/divisions/${user.divisionId}/matches`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        cvForms: `/api/divisions/${user.divisionId}/cv-forms`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
