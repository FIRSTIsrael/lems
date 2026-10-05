import { useTranslations } from 'next-intl';
import type { Edition } from '@lems/shared/edition';
import { RichText } from '../rich-text';

// The Future edition has its own (season-less) namespace, Founders strings are keyed by season.
const getScoresheetNamespace = (season: string, edition: Edition) =>
  edition === 'future' ? 'shared.scoresheet-future' : `shared.scoresheet.seasons.${season}`;

const getGeneralNamespace = (edition: Edition) =>
  edition === 'future' ? 'shared.scoresheet-future.general' : 'shared.scoresheet.general';

export const useScoresheetTranslations = (season: string, edition: Edition = 'founders') => {
  const t = useTranslations(getScoresheetNamespace(season, edition));
  const general = useTranslations(getGeneralNamespace(edition));

  return {
    getError: (errorId: string) => t(`errors.${errorId}.description`),
    getGeneralTerm: (term: string) => general(term)
  };
};

export const useScoresheetMissionTranslations = (
  season: string,
  edition: Edition,
  missionId: string
) => {
  const t = useTranslations(`${getScoresheetNamespace(season, edition)}.missions.${missionId}`);

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
    getError: (errorId: string) => t(`errors.${errorId}.description`)
  };
};

export const useScoresheetClauseTranslations = (
  season: string,
  edition: Edition,
  missionId: string,
  clauseIndex: number
) => {
  const t = useTranslations(
    `${getScoresheetNamespace(season, edition)}.missions.${missionId}.clauses.${clauseIndex}`
  );

  return {
    description: <RichText>{tags => t.rich('description', tags)}</RichText>,
    getLabel: (labelKey: string) => (
      <RichText>{tags => t.rich(`labels.${labelKey}`, tags)}</RichText>
    )
  };
};

export const useScoresheetGeneralTranslations = (edition: Edition = 'founders') => {
  const t = useTranslations(getGeneralNamespace(edition));

  return {
    yes: t('yes'),
    no: t('no'),
    getTerm: (key: string) => t(key)
  };
};
