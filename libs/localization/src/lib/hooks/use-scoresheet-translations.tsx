import { useTranslations } from 'next-intl';
import { FUTURE_SCORESHEET_SEASON } from '@lems/shared/scoresheet';
import { RichText } from '../rich-text';

const getGeneralNamespace = (season: string) =>
  season === FUTURE_SCORESHEET_SEASON
    ? 'shared.scoresheet-future.general'
    : 'shared.scoresheet.general';

/** The Future edition's scoresheet has its own namespace; past/current seasons live under `seasons.<slug>`. */
const getSeasonNamespace = (season: string) =>
  season === FUTURE_SCORESHEET_SEASON
    ? 'shared.scoresheet-future'
    : `shared.scoresheet.seasons.${season}`;

export const useScoresheetTranslations = (season: string) => {
  const t = useTranslations(getSeasonNamespace(season));
  const tGeneral = useTranslations(getGeneralNamespace(season));

  return {
    getError: (errorId: string) => t(`errors.${errorId}.description`),
    getGeneralTerm: (term: string) => tGeneral(term)
  };
};

export const useScoresheetMissionTranslations = (season: string, missionId: string) => {
  const t = useTranslations(`${getSeasonNamespace(season)}.missions.${missionId}`);

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
  missionId: string,
  clauseIndex: number
) => {
  const t = useTranslations(
    `${getSeasonNamespace(season)}.missions.${missionId}.clauses.${clauseIndex}`
  );

  return {
    description: <RichText>{tags => t.rich('description', tags)}</RichText>,
    getLabel: (labelKey: string) => (
      <RichText>{tags => t.rich(`labels.${labelKey}`, tags)}</RichText>
    )
  };
};

export const useScoresheetGeneralTranslations = (season: string) => {
  const t = useTranslations(getGeneralNamespace(season));

  return {
    yes: t('yes'),
    no: t('no'),
    getTerm: (key: string) => t(key)
  };
};
