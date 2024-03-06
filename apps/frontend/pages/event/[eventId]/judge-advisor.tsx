import { useState, useMemo } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Avatar, Box, Paper, Tab, Tabs, Typography, Stack } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import {
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Event,
  Team,
  JudgingCategory,
  Rubric,
  Award,
  CoreValuesForm,
  EventState
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import RubricStatusReferences from '../../../components/judging/rubric-status-references';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import ReportLink from '../../../components/general/report-link';
import InsightsLink from '../../../components/general/insights-link';
import JudgingRoomSchedule from '../../../components/judging/judging-room-schedule';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import AwardsPanel from '../../../components/judging/judge-advisor/awards-panel';
import CVFormCard from '../../../components/cv-form/cv-form-card';
import BadgeTab from '../../../components/general/badge-tab';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  awards: Array<WithId<Award>>;
  cvForms: Array<WithId<CoreValuesForm>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  rooms,
  eventState: initialEventState,
  teams: initialTeams,
  sessions: initialSessions,
  rubrics: initialRubrics,
  awards,
  cvForms: initialCvForms
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [rubrics, setRubrics] = useState<Array<WithId<Rubric<JudgingCategory>>>>(initialRubrics);
  const [cvForms, setCvForms] = useState<Array<WithId<CoreValuesForm>>>(initialCvForms);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [activeTab, setActiveTab] = useState<string>('1');

  const openCVForms = useMemo(
    () => cvForms.filter(cvForm => !cvForm.actionTaken).length,
    [cvForms]
  );

  awards.sort((a, b) => {
    const diff = a.index - b.index;
    if (diff !== 0) return diff;
    return a.place - b.place;
  });

  const handleSessionEvent = (session: WithId<JudgingSession>) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) return session;
        return s;
      })
    );
  };

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) return team;
        return t;
      })
    );
  };

  const updateRubric = (rubric: WithId<Rubric<JudgingCategory>>) => {
    setRubrics(rubrics =>
      rubrics.map(r => {
        if (r._id === rubric._id) return rubric;
        return r;
      })
    );
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

  const handleLeadJudgeCalled = (room: JudgingRoom) => {
    enqueueSnackbar(`חדר ${room.name} צריך עזרה!`, {
      variant: 'warning',
      persist: true
    });
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['judging', 'pit-admin', 'audience-display'],
    undefined,
    [
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent },
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'rubricStatusChanged', handler: updateRubric },
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
      { name: 'presentationUpdated', handler: setEventState },
      { name: 'leadJudgeCalled', handler: handleLeadJudgeCalled }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="judge-advisor"
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            {eventState.completed ? <InsightsLink event={event} /> : <ReportLink event={event} />}
          </Stack>
        }
      >
        <>
          <TabContext value={activeTab}>
            <Paper sx={{ mt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_e, newValue: string) => setActiveTab(newValue)}
                centered
              >
                <Tab label="שיפוט" value="1" />
                <Tab label="פרסים" value="2" />
                <BadgeTab label="טפסי CV" showBadge={openCVForms > 0} value="3" />
              </Tabs>
            </Paper>
            <TabPanel value="1">
              <Paper sx={{ borderRadius: 2, mb: 4, boxShadow: 2, p: 2 }}>
                <RubricStatusReferences />
              </Paper>
              {rooms.map(room => (
                <Paper key={room._id.toString()} sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      p: 3,
                      pb: 1
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: '#ede9fe',
                        color: '#a78bfa',
                        width: '2rem',
                        height: '2rem',
                        mr: 1
                      }}
                    >
                      <JudgingRoomIcon sx={{ fontSize: '1rem' }} />
                    </Avatar>
                    <Typography variant="h2" fontSize="1.25rem">
                      חדר שיפוט {room.name}
                    </Typography>
                  </Box>
                  <JudgingRoomSchedule
                    sessions={sessions.filter(s => s.roomId === room._id)}
                    event={event}
                    room={room}
                    teams={teams}
                    user={user}
                    socket={socket}
                    rubrics={rubrics}
                  />
                </Paper>
              ))}
            </TabPanel>
            <TabPanel value="2">
              <AwardsPanel
                awards={awards}
                event={event}
                readOnly={eventState.presentations['awards'].enabled}
                teams={teams}
                socket={socket}
              />
            </TabPanel>
            <TabPanel value="3">
              <Grid container spacing={2}>
                {cvForms.map(form => (
                  <Grid xs={6} key={form._id.toString()}>
                    <CVFormCard event={event} form={form} />
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </TabContext>
        </>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        eventState: `/api/events/${user.eventId}/state`,
        teams: `/api/events/${user.eventId}/teams`,
        rooms: `/api/events/${user.eventId}/rooms`,
        sessions: `/api/events/${user.eventId}/sessions`,
        rubrics: `/api/events/${user.eventId}/rubrics`,
        awards: `/api/events/${user.eventId}/awards`,
        cvForms: `/api/events/${user.eventId}/cv-forms`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
