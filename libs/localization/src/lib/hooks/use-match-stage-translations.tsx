import { useTranslations } from 'next-intl';

export const useMatchStageTranslations = () => {
  const t = useTranslations('shared.robot-game-stages');

  return {
    getStage: (stage: string) => t(`${stage.toLowerCase()}`),
  };
};
