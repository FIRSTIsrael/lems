import { JudgingCategory } from '@lems/types/judging';
import { useTranslations } from 'next-intl';

export const useRubricsTranslations = (category: JudgingCategory) => {
  const t = useTranslations(`shared.rubrics.categories.${category}`);

  return {
    getSectionTitle: (sectionId: string) => t(`sections.${sectionId}.title`),
    getSectionDescription: (sectionId: string) => t(`sections.${sectionId}.description`),
    getFieldLevel: (sectionId: string, fieldId: string, level: string) =>
      t(`sections.${sectionId}.fields.${fieldId}.${level}`)
  };
};

export const useRubricsGeneralTranslations = () => {
  const t = useTranslations('shared.rubrics');

  return {
    getFeedbackTitle: (key: 'great-job' | 'think-about') => t(`feedback.${key}`),
    coreValuesExplanation: t('core-values-explanation'),
    getColumnTitle: (columnKey: 'beginning' | 'developing' | 'accomplished' | 'exceeds') =>
      t(`columns.${columnKey}`),
    getTerm: (key: string) => t(key)
  };
};
