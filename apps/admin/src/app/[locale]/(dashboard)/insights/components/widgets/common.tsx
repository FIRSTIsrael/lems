'use client';

import { useTranslations } from 'next-intl';
import { Color } from '@mui/material';
import { blue, green, grey, red } from '@mui/material/colors';
import { Edition } from '@lems/shared/edition';
import { getRubrics } from '@lems/shared/rubrics';
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
 * Judging categories keep their established colors across LEMS (Innovation Project - blue,
 * Robot Design - green, Core Values - red), so category charts can be read without a legend.
 */
const CATEGORY_HUES: Record<InsightsJudgingCategory, Color> = {
  'innovation-project': blue,
  'robot-design': green,
  'core-values': red
};

const mapCategories = (getColor: (hue: Color) => string) =>
  Object.fromEntries(
    Object.entries(CATEGORY_HUES).map(([category, hue]) => [category, getColor(hue)])
  ) as Record<InsightsJudgingCategory, string>;

export const CATEGORY_COLORS = mapCategories(hue => hue[400]);

export const CATEGORY_LIGHT_COLORS = mapCategories(hue => hue[200]);

/** Sequential scale per category, from Beginning (lightest) to Exceeds (darkest). */
export const CATEGORY_LEVEL_COLORS = Object.fromEntries(
  Object.entries(CATEGORY_HUES).map(([category, hue]) => [
    category,
    [hue[100], hue[300], hue[500], hue[800]]
  ])
) as Record<InsightsJudgingCategory, string[]>;

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
