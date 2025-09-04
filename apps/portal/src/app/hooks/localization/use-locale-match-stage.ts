import { useTranslations } from 'next-intl';
import { RobotGameMatchStage } from '@lems/types';

export const useLocaleMatchStage = () => {
  const t = useTranslations('general.matchStages');
  return (stage: RobotGameMatchStage) => t(`${stage}`);
};
