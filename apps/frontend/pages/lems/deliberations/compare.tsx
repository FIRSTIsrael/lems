import { useState, useMemo } from 'react';
import { ObjectId, WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import dayjs from 'dayjs';
import {
  IconButton,
  Paper,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  LinearProgress
} from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import {
  Division,
  SafeUser,
  Team,
  Rubric,
  JudgingCategory,
  CoreValuesForm,
  Scoresheet,
  JudgingCategoryTypes
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import CompareView from '../../../components/deliberations/compare/compare-view';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import TeamSelection from '../../../components/general/team-selection';
import useCountdown from '../../../hooks/use-countdown';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<CoreValuesForm>;
}

const Page: NextPage<Props> = ({ user, division, teams, rubrics, scoresheets, cvForms }) => {
  const router = useRouter();
  const { connectionStatus } = useWebsocket(division._id.toString(), ['judging'], undefined, []);
  const [selectedTeam, setSelectedTeam] = useState<WithId<Team> | null>(null);
  const [compareTeamIds, setCompareTeamIds] = useState<Array<ObjectId>>([]);
  const [category, setCategory] = useState<JudgingCategory | 'general'>('general');

  const addTeam = (teamId: ObjectId) => {
    setCompareTeamIds(compareTeamIds => [...compareTeamIds, teamId]);
  };

  const removeTeam = (teamId: ObjectId) => {
    setCompareTeamIds(compareTeamIds => compareTeamIds.filter(id => id !== teamId));
  };

  const totalTime = 30 * (compareTeamIds.length + 1);
  const targetDate = useMemo(
    () => dayjs().add(totalTime, 'seconds').toDate(),
    [compareTeamIds, category]
  );
  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  const time = minutes * 60 + seconds;

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['judge-advisor', 'lead-judge']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1900}
        back={`/lems/${user.role}`}
        title={`השוואת קבוצות | ${division.name}`}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <Paper sx={{ mb: 2, width: '100%', position: 'sticky', top: 70, zIndex: 10 }}>
          <Stack direction="row" p={2} my={2} alignItems="center" justifyContent="space-evenly">
            <Typography fontWeight={600} fontSize="1.5rem">
              השוואת קבוצות
            </Typography>
            <Stack spacing={2} direction="row" alignItems="center">
              <TeamSelection
                setTeam={setSelectedTeam}
                teams={teams.filter(team => !compareTeamIds.includes(team._id))}
                value={selectedTeam}
                sx={{ width: 450 }}
              />
              <IconButton
                disabled={!selectedTeam}
                sx={{ width: 36, height: 36 }}
                onClick={() => {
                  addTeam(selectedTeam!._id);
                  setSelectedTeam(null);
                }}
              >
                <AddRounded />
              </IconButton>
            </Stack>
            <FormControl sx={{ width: 200 }}>
              <InputLabel id="category">תחום</InputLabel>
              <Select
                labelId="category"
                id="category-select"
                value={category}
                label="תחום"
                onChange={(event: SelectChangeEvent) =>
                  setCategory(event.target.value as JudgingCategory)
                }
              >
                {JudgingCategoryTypes.map(c => (
                  <MenuItem key={c} value={c}>
                    {localizedJudgingCategory[c].name}
                  </MenuItem>
                ))}
                <MenuItem value="general">כללי</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={time <= 0 ? 100 : (time / totalTime) * 100}
            color={time === 0 ? 'error' : 'primary'}
            sx={{
              height: 16,
              width: '100%',
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              mt: -3
            }}
          />
        </Paper>
        <CompareView
          compareTeamIds={compareTeamIds}
          teams={teams}
          rubrics={rubrics}
          cvForms={cvForms}
          scoresheets={scoresheets}
          removeTeam={removeTeam}
          category={category === 'general' ? undefined : category}
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
        division: `/api/divisions/${user.divisionId}`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        rubrics: `/api/divisions/${user.divisionId}/rubrics`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`,
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
