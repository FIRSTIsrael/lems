import { useTranslations } from 'next-intl';
import { Award } from '@lems/types/fll';
import RichText from '../../components/rich-text';

export const useLocaleAwardName = () => {
  const t = useTranslations('general.awards');
  return (award: Award) => t(`${award}.name`);
};

export const useLocaleAwardDescription = () => {
  const t = useTranslations('general.awards');
  return (award: Award) => <RichText>{tags => t.rich(`${award}.description`, tags)}</RichText>;
};
