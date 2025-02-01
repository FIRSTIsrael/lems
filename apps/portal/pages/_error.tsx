import { NextPage } from 'next';
import PageError from '../components/page-error';

interface Props {
  statusCode: number;
}

const Error: NextPage<Props> = ({ statusCode }) => {
  return (
    <PageError statusCode={statusCode} />
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : (err?.statusCode ?? 500);
  return { statusCode };
};

export default Error;
