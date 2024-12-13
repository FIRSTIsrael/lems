import { useState, useMemo } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Avatar, Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import Grid from '@mui/material/Grid2';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import {
  JudgingRoom,
  JudgingSession,
  SafeUser,
  DivisionWithEvent,
  Team,
  JudgingCategory,
  Rubric,
  CoreValuesForm,
  DivisionState,
  JudgingDeliberation,
  Award
} from '@lems/types';
import { RoleAuthorizer } from '../../components/role-authorizer';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import RubricStatusReferences from '../../components/judging/rubric-status-references';
import Layout from '../../components/layout';
import JudgingRoomSchedule from '../../components/judging/judging-room-schedule';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';
import AwardsPanel from '../../components/judging/judge-advisor/awards-panel';
import CVFormCard from '../../components/cv-form/cv-form-card';
import BadgeTab from '../../components/general/badge-tab';
import { localizeDivisionTitle } from '../../localization/event';
import { useQueryParam } from '../../hooks/use-query-param';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  divisionState: WithId<DivisionState>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  deliberations: Array<WithId<JudgingDeliberation>>;
  awards: Array<WithId<Award>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  rooms,
  divisionState: initialDivisionState,
  teams: initialTeams,
  sessions: initialSessions,
  rubrics: initialRubrics,
  cvForms: initialCvForms,
  deliberations: initialDeliberations,
  awards: initialAwards
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [rubrics, setRubrics] = useState<Array<WithId<Rubric<JudgingCategory>>>>(initialRubrics);
  const [cvForms, setCvForms] = useState<Array<WithId<CoreValuesForm>>>(initialCvForms);
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [deliberations, setDeliberations] =
    useState<Array<WithId<JudgingDeliberation>>>(initialDeliberations);
  const [awards, setAwards] = useState<Array<WithId<Award>>>(initialAwards);
  const [activeTab, setActiveTab] = useQueryParam('tab', '1');

  const openCVForms = useMemo(
    () => cvForms.filter(cvForm => !cvForm.actionTaken).length,
    [cvForms]
  );

  const handleDeliberationEvent = (deliberation: WithId<JudgingDeliberation>) => {
    setDeliberations(deliberations =>
      deliberations.map(d => {
        if (d._id === deliberation._id) return deliberation;
        return d;
      })
    );
  };

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
    division._id.toString(),
    ['judging', 'pit-admin', 'audience-display'],
    undefined,
    [
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent },
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'rubricStatusChanged', handler: updateRubric },
      { name: 'judgingDeliberationStatusChanged', handler: handleDeliberationEvent },
      { name: 'awardsUpdated', handler: setAwards },
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
      { name: 'presentationUpdated', handler: setDivisionState },
      { name: 'leadJudgeCalled', handler: handleLeadJudgeCalled }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="judge-advisor"
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        divisionState={divisionState}
        color={division.color}
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
                    division={division}
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
                division={division}
                teams={teams}
                deliberations={deliberations}
                awards={awards}
                socket={socket}
              />
            </TabPanel>
            <TabPanel value="3">
              <Grid container spacing={2}>
                {cvForms.map(form => (
                  <Grid key={form._id.toString()} size={6}>
                    <CVFormCard division={division} form={form} />
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
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        divisionState: `/api/divisions/${divisionId}/state`,
        teams: `/api/divisions/${divisionId}/teams`,
        rooms: `/api/divisions/${divisionId}/rooms`,
        sessions: `/api/divisions/${divisionId}/sessions`,
        rubrics: `/api/divisions/${divisionId}/rubrics`,
        cvForms: `/api/divisions/${divisionId}/cv-forms`,
        deliberations: `/api/divisions/${divisionId}/deliberations`,
        awards: `/api/divisions/${divisionId}/awards`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
