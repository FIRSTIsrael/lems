import { useState } from 'react';
import { ObjectId, WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import {
  IconButton,
  Paper,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
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
import TeamSelection from 'apps/frontend/components/general/team-selection';

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
  const [category, setCategory] = useState<JudgingCategory | undefined>(undefined);

  const addTeam = (teamId: ObjectId) => {
    setCompareTeamIds(compareTeamIds => [...compareTeamIds, teamId]);
  };

  const removeTeam = (teamId: ObjectId) => {
    setCompareTeamIds(compareTeamIds => compareTeamIds.filter(id => id !== teamId));
  };

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
        title={`השוואת קבוצות | ${division.name}`}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <Stack direction="row" component={Paper} sx={{ mt: 2, p: 2 }} spacing={2}>
          <Typography fontWeight={500} fontSize="1.5rem">
            השוואת קבוצות
          </Typography>
          <TeamSelection
            setTeam={setSelectedTeam}
            teams={teams.filter(team => !compareTeamIds.includes(team._id))}
            value={selectedTeam}
            sx={{ width: 300 }}
          />
          <IconButton
            disabled={!selectedTeam}
            onClick={() => {
              addTeam(selectedTeam!._id);
              setSelectedTeam(null);
            }}
          >
            <AddRounded />
          </IconButton>
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
              <MenuItem value={undefined}>כללי</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <CompareView
          compareTeamIds={compareTeamIds}
          teams={teams}
          rubrics={rubrics}
          cvForms={cvForms}
          scoresheets={scoresheets}
          removeTeam={removeTeam}
          category={category}
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
