import { NextPage, GetServerSideProps } from 'next';
import { apiFetch } from '../../../lib/utils/fetch';

export const Page: NextPage = () => {
  return <></>;
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
  return { redirect: { destination: `/event/${user.eventId}/${user.role}`, permanent: false } };
};

export default Page;
