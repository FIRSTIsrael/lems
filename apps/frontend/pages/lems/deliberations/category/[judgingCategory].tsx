import { useState, useMemo } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Box,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Button,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Grid from '@mui/material/Unstable_Grid2';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import {
  Division,
  SafeUser,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  JudgingCategoryTypes,
  JudgingDeliberation,
  AwardNames,
  CATEGORY_DELIBERATION_LENGTH,
  MANDATORY_AWARD_PICKLIST_LENGTH
} from '@lems/types';
import { reorder } from '@lems/utils/arrays';
import { localizedJudgingCategory } from '@lems/season';
import CategoryDeliberationsGrid from '../../../../components/deliberations/category-deliberations-grid';
import ScoresPerRoomChart from '../../../../components/insights/charts/scores-per-room-chart';
import TeamPool from '../team-pool';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import Layout from '../../../../components/layout';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Countdown from '../../../../components/general/countdown';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { useTime } from '../../../../hooks/use-time';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import AwardList from '../award-list';
import TeamSelection from 'apps/frontend/components/general/team-selection';
import dayjs from 'dayjs';

interface Props {
  category: JudgingCategory;
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  deliberation: WithId<JudgingDeliberation>;
}

const Page: NextPage<Props> = ({
  category,
  user,
  division,
  teams,
  rubrics,
  rooms,
  sessions,
  cvForms,
  scoresheets,
  deliberation: initialDeliberation
}) => {
  const router = useRouter();
  const [deliberation, setDeliberation] =
    useState<WithId<JudgingDeliberation>>(initialDeliberation);
  const availableTeams = teams.filter(t => t.registered).sort((a, b) => a.number - b.number);
  const selectedTeams = [...new Set(Object.values(deliberation.awards).flat(1))].map(
    teamId => teams.find(t => t._id === teamId) ?? ({} as WithId<Team>)
  );
  const endTime = deliberation.startTime
    ? dayjs(deliberation.startTime).add(CATEGORY_DELIBERATION_LENGTH, 'seconds')
    : undefined;
  const currentTime = useTime({ interval: 1000 });

  const startDeliberation = (divisionId: string, deliberationId: string): void => {
    socket.emit('startJudgingDeliberation', divisionId, deliberationId, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, התחלת דיון השיפוט נכשלה.', { variant: 'error' });
      } else {
        new Audio('/assets/sounds/judging/judging-start.wav').play();
      }
    });
  };

  const handleDeliberationEvent = (newDeliberation: WithId<JudgingDeliberation>) => {
    if (newDeliberation._id.toString() === deliberation._id.toString()) {
      setDeliberation(newDeliberation);
    }
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['judging'],
    undefined,
    [
      { name: 'judgingDeliberationStarted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationCompleted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationUpdated', handler: handleDeliberationEvent }
    ]
  );

  const getPicklist = (name: AwardNames) => {
    return [...(deliberation.awards[name] ?? [])];
  };

  const isTeamInPicklist = (teamId: string, name: AwardNames) => {
    return !!getPicklist(name).find(id => id.toString() === teamId);
  };

  const setPicklist = (name: AwardNames, newList: Array<ObjectId>) => {
    const newDeliberation = { ...deliberation };
    newDeliberation.awards[name] = newList;

    setDeliberation(newDeliberation);
    socket.emit(
      'updateJudgingDeliberation',
      division._id.toString(),
      deliberation._id.toString(),
      { awards: newDeliberation.awards },
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, עדכון דיון השיפוט נכשל.', { variant: 'error' });
        }
      }
    );
  };

  const addTeamToPicklist = (teamId: string, index: number, name: AwardNames) => {
    const picklist: Array<string | ObjectId> = [...getPicklist(name)];
    if (picklist.length >= MANDATORY_AWARD_PICKLIST_LENGTH) {
      return;
    }

    picklist.splice(index, 0, teamId);
    setPicklist(name, picklist as Array<ObjectId>);
  };

  const removeTeamFromPicklist = (teamId: string, name: AwardNames) => {
    const newPicklist = getPicklist(name).filter(id => id.toString() !== teamId);
    setPicklist(name, newPicklist);
  };

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['lead-judge', 'judge-advisor']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1900}
        title={`דיון תחום ${localizedJudgingCategory[category].name} | בית ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <DragDropContext
          onDragEnd={result => {
            const { source, destination, draggableId } = result;
            if (!destination) {
              return;
            }
            const teamId = draggableId.split(':')[1];

            if (destination.droppableId === 'trash') {
              if (source.droppableId === 'team-pool') {
                return;
              }
              removeTeamFromPicklist(teamId, source.droppableId as AwardNames);
              return;
            }

            const name = destination.droppableId as AwardNames;
            switch (source.droppableId) {
              case 'team-pool':
                if (isTeamInPicklist(teamId, name)) {
                  return;
                }
                addTeamToPicklist(teamId, destination.index, name);
                break;
              case destination.droppableId:
                const reordered = reorder(getPicklist(name), source.index, destination.index);
                setPicklist(name, reordered);
                break;
              default:
                //Move from list to other list
                break;
            }
          }}
        >
          <Grid container sx={{ pt: 2 }} columnSpacing={4} rowSpacing={2}>
            <Grid xs={8}>
              <CategoryDeliberationsGrid
                category={category}
                rooms={rooms}
                rubrics={rubrics}
                scoresheets={scoresheets}
                sessions={sessions}
                teams={teams}
                selectedTeams={selectedTeams}
                cvForms={cvForms}
              />
            </Grid>
            <Grid xs={1.5}>
              <AwardList
                id={category}
                pickList={
                  deliberation.awards[category as AwardNames]?.map(
                    teamId => teams.find(t => t._id === teamId) ?? ({} as WithId<Team>)
                  ) ?? []
                }
              />
            </Grid>
            <Grid xs={2.5}>
              <Stack component={Paper} spacing={3} p={2} sx={{ height: '100%' }}>
                <Box
                  sx={{
                    marginTop: 5,
                    position: 'relative',
                    display: 'inline-flex',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={
                      endTime
                        ? endTime > dayjs()
                          ? (endTime.diff(currentTime, 'seconds') / CATEGORY_DELIBERATION_LENGTH) *
                            100
                          : 100
                        : 0
                    }
                    color={endTime && endTime > dayjs() ? 'primary' : 'error'}
                    size={250}
                    sx={{ '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {endTime ? (
                      <Countdown
                        targetDate={endTime.toDate()}
                        fontSize="3.5rem"
                        fontWeight={600}
                        textAlign="center"
                        expiredText="00:00"
                      />
                    ) : (
                      <IconButton
                        onClick={() =>
                          startDeliberation(division._id.toString(), deliberation._id.toString())
                        }
                      >
                        <PlayCircleOutlinedIcon
                          sx={{ width: '8rem', height: '8rem' }}
                          color="primary"
                        />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Divider />
                <Box display="flex" alignItems="center">
                  <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
                    <InputLabel>חיפוש קבוצה</InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type="text"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="search"
                            onClick={() => ({})}
                            onMouseDown={() => ({})}
                            edge="end"
                          >
                            {/* TODO: If not empty should be clear button */}
                            <SearchOutlinedIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                      label="חיפוש קבוצה"
                    />
                  </FormControl>
                </Box>
                <Divider />
                <Stack spacing={1.5} direction="row" alignItems="center" justifyContent="center">
                  <TeamSelection teams={teams} setTeam={() => ({})} value={null} fullWidth />
                  <Typography>מול</Typography>
                  <TeamSelection teams={teams} setTeam={() => ({})} value={null} fullWidth />
                </Stack>
                <Stack
                  spacing={2}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-around"
                  paddingX="8px"
                >
                  <Button variant="contained" fullWidth>
                    סימון
                  </Button>
                  <Button variant="contained" fullWidth>
                    ניקוי
                  </Button>
                  <Button variant="contained" fullWidth>
                    השוואה
                  </Button>
                </Stack>
                <Divider />
                <Droppable droppableId="trash">
                  {(provided, snapshot) => (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        border: snapshot.isDraggingOver ? '3px dashed #ccc' : '',
                        backgroundColor: '#f4f4f4'
                      }}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <DeleteOutlinedIcon
                        sx={{ marginY: '5px', height: 40, width: 40, color: '#aaa' }}
                      />
                      <span style={{ display: 'none' }}>{provided.placeholder}</span>
                    </Box>
                  )}
                </Droppable>
              </Stack>
            </Grid>
            <Grid xs={5}>
              <ScoresPerRoomChart division={division} height={210} />
            </Grid>
            <Grid xs={7}>
              <TeamPool teams={availableTeams} id="team-pool" />
            </Grid>
          </Grid>
        </DragDropContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
    const category = ctx.params?.judgingCategory as JudgingCategory;

    if (!JudgingCategoryTypes.includes(category)) {
      return { notFound: true };
    }

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${user.divisionId}`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        rubrics: `/api/divisions/${user.divisionId}/rubrics/${ctx.params?.judgingCategory}`,
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`,
        cvForms: `/api/divisions/${user.divisionId}/cv-forms`,
        deliberation: `/api/divisions/${user.divisionId}/deliberations/${ctx.params?.judgingCategory}`
      },
      ctx
    );

    return { props: { user, ...data, category } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
