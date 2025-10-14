import { GetServerSideProps, NextPage } from 'next';

const Page: NextPage = () => {
  return <></>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: '/login', permanent: false } };
};

export default Page;
