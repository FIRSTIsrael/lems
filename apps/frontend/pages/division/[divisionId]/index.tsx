import { NextPage, GetServerSideProps } from 'next';
import { apiFetch } from '../../../lib/utils/fetch';

export const Page: NextPage = () => {
  return <></>;
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res =>
    res.ok ? res.json() : undefined
  );
  return {
    redirect: {
      destination: user ? `/division/${user.divisionId}/${user.role}` : '/login',
      permanent: false
    }
  };
};

export default Page;
