import { useTranslations } from 'next-intl';

export const useJudgingSessionTranslations = () => {
  const t = useTranslations('shared.judging-sessions');

  return {
    getStatus: (status: 'not-started' | 'in-progress' | 'completed') =>
      t(`status.${status.toLowerCase()}`)
  };
};
