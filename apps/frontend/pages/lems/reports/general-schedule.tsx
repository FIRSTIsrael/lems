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
  TableRow
} from '@mui/material';
import { Division, SafeUser, RoleTypes, DivisionScheduleEntry } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { enqueueSnackbar } from 'notistack';

interface DivisionScheduleRowProps {
  entry: DivisionScheduleEntry;
}

const DivisionScheduleRow: React.FC<DivisionScheduleRowProps> = ({ entry }) => {
  return (
    <TableRow
      key={entry.name + entry.roles.toString()}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell>{dayjs(entry.startTime).format('HH:mm')}</TableCell>
      <TableCell>{dayjs(entry.endTime).format('HH:mm')}</TableCell>
      <TableCell>{entry.name}</TableCell>
      <TableCell>{entry.roles.map(r => localizedRoles[r].name).join(', ')}</TableCell>
    </TableRow>
  );
};

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
}

const Page: NextPage<Props> = ({ user, division }) => {
  const router = useRouter();
  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - לו״ז כללי | ${division.name}`}
        back={`/lems/reports`}
        backDisabled={false}
        color={division.color}
      >
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>התחלה</TableCell>
                <TableCell>סיום</TableCell>
                <TableCell>שם האירוע</TableCell>
                <TableCell>תפקידים</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {division.schedule?.map((s, index) => {
                return <DivisionScheduleRow key={index} entry={s} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      { division: `/api/divisions/${user.divisionId}?withSchedule=true` },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
