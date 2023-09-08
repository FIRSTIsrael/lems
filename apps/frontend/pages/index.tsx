import { GetServerSideProps } from 'next';

export function Index() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: '/login', permanent: false } };
};

export default Index;
