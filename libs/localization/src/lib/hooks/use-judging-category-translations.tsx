import { useTranslations } from 'next-intl';

export const useJudgingCategoryTranslations = () => {
  const t = useTranslations('shared.judging-categories');

  return {
    getCategory: (category: string) => t(`${category.toLowerCase()}`)
  };
};
