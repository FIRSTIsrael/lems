import { useTranslations } from 'next-intl';
import { AwardNames } from '@lems/types';

export const useLocaleAwardName = () => {
  const t = useTranslations('hooks.useAwardName');
  return (awardName: AwardNames) => t(`awards.${awardName}.name`);
};

export const useLocaleAwardDescription = () => {
  const t = useTranslations('hooks.useAwardName');
  return (awardName: AwardNames) => t(`awards.${awardName}.description`);
};
