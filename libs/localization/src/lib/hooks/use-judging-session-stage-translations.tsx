import { useTranslations } from 'next-intl';

export const useJudgingSessionStageTranslations = () => {
  const t = useTranslations('shared.judging-session-stages');

  return {
    getStage: (stage: string) => t(`${stage.toLowerCase()}`)
  };
};
