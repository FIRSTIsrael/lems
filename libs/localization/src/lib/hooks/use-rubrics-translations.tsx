import { JudgingCategory } from '@lems/types/judging';
import type { Edition } from '@lems/shared/edition';
import { useTranslations } from 'next-intl';

const getRubricsNamespace = (edition: Edition) =>
  edition === 'future' ? 'shared.rubrics-future' : 'shared.rubrics';

export const useRubricsTranslations = (category: JudgingCategory, edition: Edition) => {
  const t = useTranslations(`${getRubricsNamespace(edition)}.categories.${category}`);

  return {
    getSectionTitle: (sectionId: string) => t(`sections.${sectionId}.title`),
    getSectionDescription: (sectionId: string) => t(`sections.${sectionId}.description`),
    getFieldLevel: (sectionId: string, fieldId: string, level: string) =>
      t(`sections.${sectionId}.fields.${fieldId}.${level}`),
    getFieldCriterion: (sectionId: string, fieldId: string) =>
      t(`sections.${sectionId}.fields.${fieldId}.criterion`)
  };
};

export const useRubricsGeneralTranslations = (edition: Edition) => {
  const t = useTranslations(getRubricsNamespace(edition));

  return {
    getFeedbackTitle: (key: 'greatJob' | 'thinkAbout') => {
      const kebabCaseKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      return t(`feedback.${kebabCaseKey}`);
    },
    coreValuesExplanation: t('core-values-explanation'),
    getColumnTitle: (columnKey: 'beginning' | 'developing' | 'accomplished' | 'exceeds') =>
      t(`columns.${columnKey}`),
    getTerm: (key: string) => t(key)
  };
};
