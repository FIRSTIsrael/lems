import { useTranslations } from 'next-intl';
import type { Edition } from '@lems/shared/edition';
import { resolveEditionKey } from './edition-key';

export const useJudgingSessionStageTranslations = (edition: Edition) => {
  const t = useTranslations('shared.judging-session-stages');

  return {
    getStage: (stage: string) =>
      t(resolveEditionKey(key => t.has(key), edition, stage.toLowerCase()))
  };
};
