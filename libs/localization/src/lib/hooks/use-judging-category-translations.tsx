import { useTranslations } from 'next-intl';
import type { Edition } from '@lems/shared/edition';
import { resolveEditionKey } from './edition-key';

export const useJudgingCategoryTranslations = (edition: Edition) => {
  const t = useTranslations('shared.judging-categories');

  return {
    getCategory: (category: string) =>
      t(resolveEditionKey(key => t.has(key), edition, category.toLowerCase()))
  };
};
