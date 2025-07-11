import { GetServerSideProps, NextPage } from 'next';

const Page: NextPage = () => {
  return (
    <>
      <h1>Admin Dashboard</h1>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: '/admin/login', permanent: false } };
};

export default Page;
