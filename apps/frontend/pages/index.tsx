import { GetServerSideProps } from 'next';

export function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.@emotion/styled file.
   */
  return (
    <div>
      <p>Hello world</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://localhost:3333/api');
  if (!res.ok) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: {} };
};

export default Index;
