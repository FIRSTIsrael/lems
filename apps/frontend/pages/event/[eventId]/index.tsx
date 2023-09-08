import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { SafeUser } from '@lems/types';
import useLocalStorage from '../../../hooks/use-local-storage';

export function Index() {
  const router = useRouter();
  const [user, setUser] = useLocalStorage<SafeUser>('user', {} as SafeUser);

  if (user) {
    router.push({
      pathname: `/event/${user.event}/${user.role}`
    });
  } else {
    router.push({
      pathname: '/login',
      query: { returnUrl: router.asPath }
    });
  }

  return <></>;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Index;
