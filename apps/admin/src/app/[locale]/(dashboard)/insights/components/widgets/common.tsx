'use client';

import { useTranslations } from 'next-intl';
import { blue, green, red, amber, purple, grey } from '@mui/material/colors';
import { Edition } from '@lems/shared/edition';
import { getRubrics } from '@lems/shared/rubrics';
import { InsightsJudgingCategory, InsightsStage } from '@lems/types/api/admin';

export interface WidgetProps {
  divisionId: string;
  edition: Edition;
  /** Robot game stage filter. Undefined means all stages. */
  stage?: InsightsStage;
}

export const CATEGORY_COLORS: Record<InsightsJudgingCategory, string> = {
  'innovation-project': blue[500],
  'robot-design': green[500],
  'core-values': red[400]
};

export const CHART_COLORS = {
  primary: blue[600],
  primaryLight: blue[200],
  secondary: amber[700],
  positive: green[500],
  negative: red[500],
  neutral: grey[500],
  accent: purple[400]
};

export const RUBRIC_LEVEL_COLORS = [red[300], amber[400], green[300], green[700]];

export const tooltipStyle = {
  contentStyle: { borderRadius: 8, fontSize: 13 },
  labelStyle: { fontWeight: 600 }
};

export const useStageLabel = () => {
  const t = useTranslations('shared.robot-game-matches.stages');
  return (stage: string) => t(stage.toLowerCase());
};

/** The mission's official title from the shared scoresheet translations. */
export const useMissionTitle = () => {
  const t = useTranslations('shared.scoresheet.missions');
  return (missionId: string) => t(`${missionId}.title`);
};

export const useMissionLabel = () => {
  const t = useTranslations('shared.scoresheet.missions');
  return (missionId: string) =>
    t.has(`${missionId}.title`)
      ? `${missionId.toUpperCase()} - ${t(`${missionId}.title`)}`
      : missionId.toUpperCase();
};

/**
 * Builds a readable label for a rubric field, based on the section it belongs to.
 * Core Values fields are prefixed with 'ip-' / 'rd-' and labelled with their source category.
 */
export const useRubricFieldLabel = (edition: Edition) => {
  const t = useTranslations('shared.rubrics.categories');
  const tCategory = useTranslations('shared.judging-categories');
  const rubrics = getRubrics(edition);

  return (category: InsightsJudgingCategory, fieldId: string): string => {
    let sourceCategory: 'innovation-project' | 'robot-design' | null =
      category === 'core-values' ? null : category;
    let id = fieldId;
    if (category === 'core-values') {
      sourceCategory = fieldId.startsWith('ip-') ? 'innovation-project' : 'robot-design';
      id = fieldId.slice(3);
    }
    if (!sourceCategory) return fieldId;

    const section = rubrics[sourceCategory].sections.find(s => s.fields.some(f => f.id === id));
    if (!section) return fieldId;
    const index = section.fields.findIndex(f => f.id === id) + 1;
    const label = `${t(`${sourceCategory}.sections.${section.id}.title`)} ${index}`;
    return category === 'core-values' ? `${tCategory(sourceCategory)} · ${label}` : label;
  };
};
