import { NextPage } from 'next';
import PageError from '../components/page-error';

const Custom404: NextPage = () => {
  return (
    <PageError statusCode={404} />
  );
};

export default Custom404;
