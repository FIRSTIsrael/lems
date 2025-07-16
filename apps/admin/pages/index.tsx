import { GetServerSideProps, NextPage } from 'next';
import { AdminLayout } from '../components/layout/layout';

const Page: NextPage = () => {
  return (
    <AdminLayout>
      <p>Admin Dashboard</p>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Page;
