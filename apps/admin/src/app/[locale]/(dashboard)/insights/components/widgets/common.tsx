'use client';

import { useTranslations } from 'next-intl';
import { Color } from '@mui/material';
import { blue, green, grey, orange, red } from '@mui/material/colors';
import { Edition } from '@lems/shared/edition';
import { getRubrics } from '@lems/shared/rubrics';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { InsightsJudgingCategory, InsightsStage } from '@lems/types/api/admin';
import { defaultColor } from '../../../../../../theme';

export interface WidgetProps {
  divisionId: string;
  edition: Edition;
  /** The scoresheet season used by the division, which selects the mission set and translations. */
  season: string;
  /** Robot game stage filter. Undefined means all stages. */
  stage?: InsightsStage;
}

/**
 * Judging categories keep their established colors across LEMS, so category charts can be read
 * without a legend: Innovation Project - blue, Core Values - red, and Robot Design - green in
 * Founders Edition / Engineering Design - orange in Future Edition (matching `getRubricColors`).
 */
const CATEGORY_HUES: Record<Edition, Record<InsightsJudgingCategory, Color>> = {
  founders: { 'innovation-project': blue, 'robot-design': green, 'core-values': red },
  future: { 'innovation-project': blue, 'robot-design': orange, 'core-values': red }
};

export interface CategoryColors {
  /** Primary data color (e.g. averages). */
  main: string;
  /** Secondary data color (e.g. medians). */
  light: string;
  /** Sequential scale from Beginning (lightest) to Exceeds (darkest). */
  levels: [string, string, string, string];
}

const buildCategoryColors = (hue: Color): CategoryColors => ({
  main: hue[400],
  light: hue[200],
  levels: [hue[100], hue[300], hue[500], hue[800]]
});

export const getCategoryColors = (
  edition: Edition
): Record<InsightsJudgingCategory, CategoryColors> => {
  const hues = CATEGORY_HUES[edition];
  return {
    'innovation-project': buildCategoryColors(hues['innovation-project']),
    'robot-design': buildCategoryColors(hues['robot-design']),
    'core-values': buildCategoryColors(hues['core-values'])
  };
};

/**
 * Generic data colors, built from the admin theme's primary color so charts match the rest of the app.
 * Used wherever color carries no meaning of its own.
 */
export const CHART_COLORS = {
  primary: defaultColor,
  primaryLight: '#8fb3d6',
  secondary: '#3d7cb8',
  /** Reference lines such as averages and zero lines. */
  reference: grey[500]
};

/**
 * Props for an X axis of named items (tables, rooms, rounds...). Recharts hides labels that would
 * overlap by default, so every label is forced to show, and they are tilted once there are many items.
 */
export const categoryAxisProps = (count: number) => {
  const tilted = count > 5;
  return {
    interval: 0 as const,
    tick: { fontSize: 12 },
    angle: tilted ? -30 : 0,
    textAnchor: tilted ? ('end' as const) : ('middle' as const),
    height: tilted ? 60 : 30
  };
};

export const tooltipStyle = {
  contentStyle: { borderRadius: 8, fontSize: 13 },
  labelStyle: { fontWeight: 600 }
};

export const useStageLabel = () => {
  const t = useTranslations('shared.robot-game-matches.stages');
  return (stage: string) => t(stage.toLowerCase());
};

/** The mission's official title from the shared, season-specific scoresheet translations. */
export const useMissionTitle = (season: string) => {
  const t = useTranslations('shared.scoresheet.seasons');
  return (missionId: string) => {
    const key = `${season}.missions.${missionId}.title`;
    return t.has(key) ? t(key) : missionId.toUpperCase();
  };
};

export const useMissionLabel = (season: string) => {
  const t = useTranslations('shared.scoresheet.seasons');
  return (missionId: string) => {
    const key = `${season}.missions.${missionId}.title`;
    return t.has(key) ? `${missionId.toUpperCase()} - ${t(key)}` : missionId.toUpperCase();
  };
};

/**
 * Builds a readable label for a rubric field, based on the section it belongs to.
 * Core Values fields are prefixed with 'ip-' / 'rd-' and labelled with their source category.
 */
export const useRubricFieldLabel = (edition: Edition) => {
  const t = useTranslations(
    edition === 'future' ? 'shared.rubrics-future.categories' : 'shared.rubrics.categories'
  );
  const { getCategory } = useJudgingCategoryTranslations(edition);
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
    return category === 'core-values' ? `${getCategory(sourceCategory)} · ${label}` : label;
  };
};
