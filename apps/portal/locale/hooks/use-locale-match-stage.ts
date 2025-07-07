import { useTranslations } from 'next-intl';
import { RobotGameMatchStage } from '@lems/types';

export const useLocaleMatchStage = () => {
  const t = useTranslations('hooks:useMatchStage');
  return (stage: RobotGameMatchStage) => t(`stages.${stage}`);
};
