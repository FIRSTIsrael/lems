import { useTranslations } from 'next-intl';
import { AwardNames } from '@lems/types';

export const useLocaleAwardName = () => {
  const t = useTranslations('general.awards');
  return (awardName: AwardNames) => t(`${awardName}.name`);
};

export const useLocaleAwardDescription = () => {
  const t = useTranslations('general.awards');
  return (awardName: AwardNames) => t(`${awardName}.description`);
};
