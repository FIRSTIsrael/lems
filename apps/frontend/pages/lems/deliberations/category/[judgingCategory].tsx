import { useState, useMemo } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Box,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  makeStyles,
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
  JudgingCategoryTypes
} from '@lems/types';
import { reorder } from '@lems/utils/arrays';
import { localizedJudgingCategory } from '@lems/season';
import CategoryDeliberationsGrid from '../../../../components/deliberations/category-deliberations-grid';
import ScoresPerRoomChart from '../../../../components/insights/charts/scores-per-room-chart';
import TeamPool from '../team-pool';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { copyToDroppable } from '../../../../lib/utils/dnd';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import AwardList from '../award-list';
import TeamSelection from 'apps/frontend/components/general/team-selection';

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
  scoresheets
}) => {
  const router = useRouter();
  const availableTeams = teams.filter(t => t.registered).sort((a, b) => a.number - b.number);

  const [picklists, setPicklists] = useState<{ [key: string]: Array<WithId<Team>> }>({});
  const selectedTeams = useMemo<Array<number>>(
    () =>
      Object.values(picklists)
        .flat()
        .map(t => t.number),
    [picklists]
  );

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
        // error={connectionStatus === 'disconnected'}
        // action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <DragDropContext
          onDragEnd={result => {
            console.log(result);

            const { source, destination } = result;
            if (!destination) {
              return;
            }

            switch (source.droppableId) {
              case destination.droppableId:
                setPicklists(current => ({
                  ...current,
                  [destination.droppableId]: reorder(
                    current[destination.droppableId] || [],
                    source.index,
                    destination.index
                  )
                }));
                break;
              case 'teamPool':
                if (
                  picklists[destination.droppableId]?.find(
                    t => t.number === availableTeams[source.index].number
                  )
                ) {
                  // TODO: some visual cue for this being a duplicate team
                  break;
                }
                setPicklists(current => ({
                  ...current,
                  [destination.droppableId]: copyToDroppable(
                    availableTeams,
                    current[destination.droppableId] || [],
                    source,
                    destination
                  )
                }));
                break;
              default:
                // this.setState(
                //   move(
                //     this.state[source.droppableId],
                //     this.state[destination.droppableId],
                //     source,
                //     destination
                //   )
                // );
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
              <AwardList id="categoryRankings" state={picklists['categoryRankings'] || []} />
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
                    value={80}
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
                    <Typography fontSize="3.5rem" fontWeight={600} textAlign="center">
                      44:37
                    </Typography>
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
                            {/* If empty should be clear button */}
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
                    </Box>
                  )}
                </Droppable>
              </Stack>
            </Grid>
            <Grid xs={5}>
              <ScoresPerRoomChart division={division} height={210} />
            </Grid>
            <Grid xs={7}>
              <TeamPool teams={availableTeams} id="teamPool" />
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
        cvForms: `/api/divisions/${user.divisionId}/cv-forms`
      },
      ctx
    );

    return { props: { user, ...data, category } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
