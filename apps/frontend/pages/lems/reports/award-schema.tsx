import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  DivisionWithEvent,
  SafeUser,
  RoleTypes,
  EventUserAllowedRoles,
  Award,
  AwardNames
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { localizeDivisionTitle } from '../../../localization/event';
import DivisionDropdown from '../../../components/general/division-dropdown';
import { localizedAward } from '@lems/season';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  awards: Array<WithId<Award>>;
}

const Page: NextPage<Props> = ({ user, division, awards }) => {
  const router = useRouter();
  console.log(awards);
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
        title={`ממשק ${user.role && localizedRoles[user.role].name} - סדר הפרסים | ${localizeDivisionTitle(division)}`}
        back={`/lems/reports`}
        backDisabled={false}
        color={division.color}
        action={
          division.event.eventUsers.includes(user.role as EventUserAllowedRoles) && (
            <DivisionDropdown event={division.event} selected={division._id.toString()} />
          )
        }
      >
        <TableContainer component={Paper} sx={{ my: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>פרס</TableCell>
                <TableCell>מקום</TableCell>
                <TableCell>תיאור</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {awards
                .sort((a, b) => {
                  const indexDiff = a.index - b.index;
                  if (indexDiff !== 0) {
                    return indexDiff;
                  }
                  const placeDiff = b.place - a.place;
                  return placeDiff;
                })
                .map(award => (
                  <TableRow key={award.name}>
                    <TableCell>{localizedAward[award.name as AwardNames].name}</TableCell>
                    <TableCell>{award.place}</TableCell>
                    <TableCell>{localizedAward[award.name as AwardNames].description}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
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
        awards: `/api/divisions/${divisionId}/awards/schema`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
