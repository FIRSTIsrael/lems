import { useTranslations } from 'next-intl';
import { RichText } from '../rich-text';

/**
 * Hook for general scoresheet translations (errors, common terms, etc.)
 */
export const useScoresheetTranslations = () => {
  const t = useTranslations('shared.scoresheet');

  return {
    getError: (errorId: string) => t(`errors.${errorId}`),
    getGeneralTerm: (term: string) => t(`general.${term}`)
  };
};

/**
 * Hook for scoresheet error translations - compatible with existing usage
 */
export const useLocaleScoresheetError = () => {
  const { getError } = useScoresheetTranslations();
  return getError;
};

/**
 * Hook for mission-specific translations
 */
export const useScoresheetMission = (missionId: string) => {
  const t = useTranslations(`shared.scoresheet.missions.${missionId}`);

  const getRemarks = () => {
    const remarks: string[] = [];
    let index = 0;
    while (t.has(`remarks.${index}`)) {
      remarks.push(t(`remarks.${index}`));
      index++;
    }
    return remarks;
  };

  return {
    title: t('title'),
    description: t.has('description') ? (
      <RichText>{tags => t.rich('description', tags)}</RichText>
    ) : null,
    remarks: getRemarks(),
    getClauseDescription: (clauseIndex: number) => (
      <RichText>{tags => t.rich(`clauses.${clauseIndex}.description`, tags)}</RichText>
    ),
    getClauseLabel: (clauseIndex: number, labelKey: string) => (
      <RichText>{tags => t.rich(`clauses.${clauseIndex}.labels.${labelKey}`, tags)}</RichText>
    ),
    getError: (errorId: string) => t(`errors.${errorId}`)
  };
};

/**
 * Hook for mission clause-specific translations
 */
export const useScoresheetClause = (missionId: string, clauseIndex: number) => {
  const t = useTranslations(`shared.scoresheet.missions.${missionId}.clauses.${clauseIndex}`);

  return {
    description: <RichText>{tags => t.rich('description', tags)}</RichText>,
    getLabel: (labelKey: string) => (
      <RichText>{tags => t.rich(`labels.${labelKey}`, tags)}</RichText>
    )
  };
};

/**
 * Hook for general scoresheet UI terms
 */
export const useScoresheetGeneral = () => {
  const t = useTranslations('shared.scoresheet.general');

  return {
    yes: t('yes'),
    no: t('no'),
    getTerm: (key: string) => t(key)
  };
};
