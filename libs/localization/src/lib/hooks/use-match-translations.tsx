import { useTranslations } from 'next-intl';

export const useMatchTranslations = () => {
  const t = useTranslations('shared.robot-game-matches');

  return {
    getStage: (stage: 'PRACTICE' | 'RANKING' | 'TEST') => t(`stages.${stage.toLowerCase()}`),
    getStatus: (status: 'not-started' | 'in-progress' | 'completed') =>
      t(`status.${status.toLowerCase()}`)
  };
};
