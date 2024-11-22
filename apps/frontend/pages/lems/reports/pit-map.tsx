import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Paper, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Division, SafeUser, RoleTypes } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  pitMapUrl: string;
}

const Page: NextPage<Props> = ({ user, division, pitMapUrl }) => {
  const router = useRouter();
  const [error, setError] = useState<boolean>(false);
  const { connectionStatus } = useWebsocket(division._id.toString(), ['pit-admin'], undefined, []);

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
        title={`ממשק ${user.role && localizedRoles[user.role].name} - מפת פיטים | ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/lems/reports`}
        backDisabled={connectionStatus === 'connecting'}
        color={division.color}
      >
        {!error ? (
          <Image
            src={`${pitMapUrl}/${division._id}.png`}
            alt={`מפת פיטים ל${division.name}`}
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
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
    const data = await serverSideGetRequests(
      { division: `/api/divisions/${user.divisionId}` },
      ctx
    );

    const pitMapUrl = `https://${process.env.DIGITALOCEAN_SPACE}.${process.env.DIGITALOCEAN_ENDPOINT}/pit-maps`;

    return { props: { user, pitMapUrl, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
