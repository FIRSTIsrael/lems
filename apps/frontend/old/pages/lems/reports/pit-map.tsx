import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Paper, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { DivisionWithEvent, SafeUser, RoleTypes } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { localizeDivisionTitle } from '../../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  pitMapUrl: string;
}

const Page: NextPage<Props> = ({ user, division, pitMapUrl }) => {
  const router = useRouter();
  const [error, setError] = useState<boolean>(false);

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
        maxWidth="xl"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - מפת פיטים | ${localizeDivisionTitle(division)}`}
        user={user}
        division={division}
        back={`/lems/reports`}
        color={division.color}
      >
        {!error ? (
          <Image
            src={`${pitMapUrl}/${division._id}.png`}
            alt={`מפת פיטים ל${localizeDivisionTitle(division)}`}
            width={0}
            height={0}
            sizes="100vw"
            style={{
              marginTop: '40px',
              width: '100%',
              height: 'auto',
              borderRadius: '1rem',
              border: '1px solid',
              borderColor: grey[200]
            }}
            onError={() => setError(true)}
          />
        ) : (
          <Stack spacing={2} component={Paper} textAlign="center" alignItems="center" p={4} mt={8}>
            <Image width={64} height={64} src="https://emojicdn.elk.sh/😢" alt="אימוג'י בוכה" />
            <Typography fontSize="2.25rem" fontWeight={600}>
              אופס, לא נמצאה מפת פיטים לאירוע
            </Typography>
            <Typography fontSize="1.5rem" color="textSecondary">
              נא לפנות למנהל המערכת.
            </Typography>
          </Stack>
        )}
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);
    const data = await serverSideGetRequests(
      { division: `/api/divisions/${divisionId}?withEvent=true` },
      ctx
    );

    const pitMapUrl = `https://${process.env.DIGITALOCEAN_SPACE}.${process.env.DIGITALOCEAN_ENDPOINT}/pit-maps`;

    return { props: { user, pitMapUrl, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
