import { NextPage, GetServerSideProps } from 'next';
import { apiFetch } from '../../../../lib/utils/fetch';

export const Page: NextPage = () => {
  return <></>;
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res =>
    res.ok ? res.json() : undefined
  );

  let destination = '/login';
  if (user) destination = `/event/${user.eventId}/${user.role}`;
  if (user.role === 'queuer' && user.roleAssociation?.value)
    destination += `/${user.roleAssociation?.value}`;
  return { redirect: { destination, permanent: false } };
};

export default Page;
