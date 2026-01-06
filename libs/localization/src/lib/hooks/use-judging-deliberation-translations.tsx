import { useTranslations } from 'next-intl';

export const useJudgingDeliberationTranslations = () => {
  const t = useTranslations('shared.judging-deliberations');

  return {
    getStatus: (status: string) => t(`status.${status.toLowerCase()}`),
    getStage: (stage: string) => t(`stage.${stage.toLowerCase()}`)
  };
};
