'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Grid, Paper } from '@mui/material';
import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';
import type { Team } from '../graphql/types';
import { useCompareContext } from '../compare-context';
import {
  getCategoryColor,
  getCategoryBgColor,
  getFieldComparisonColor,
  type FieldComparisons
} from './rubric-scores-utils';
import { SectionScoreRow } from './section-score-row';

interface RubricScoresProps {
  team: Team;
}

interface SectionFields {
  [sectionId: string]: Array<{
    fieldId: string;
    value: number | null;
    color: 'success' | 'error' | 'default';
  }>;
}

interface FieldsByCategories {
  [category: string]: SectionFields;
}

const processFieldsBySections = (
  team: Team,
  fieldComparisons: FieldComparisons,
  category?: string
): FieldsByCategories => {
  const categories = category ? [category] : ['innovation-project', 'robot-design', 'core-values'];
  const result: FieldsByCategories = {};

  categories.forEach(cat => {
    if (cat === 'core-values') {
      const fields = [
        ...Object.entries(team.rubrics.innovation_project?.data?.fields || {})
          .filter(([id]) =>
            rubrics['innovation-project'].sections.some(s =>
              s.fields.some(f => f.id === id && f.coreValues)
            )
          )
          .map(([id, field]) => ({
            fieldId: id,
            value: field.value,
            color: getFieldComparisonColor(id, team.id, fieldComparisons, 'ip')
          })),
        ...Object.entries(team.rubrics.robot_design?.data?.fields || {})
          .filter(([id]) =>
            rubrics['robot-design'].sections.some(s =>
              s.fields.some(f => f.id === id && f.coreValues)
            )
          )
          .map(([id, field]) => ({
            fieldId: id,
            value: field.value,
            color: getFieldComparisonColor(id, team.id, fieldComparisons, 'rd')
          }))
      ];
      if (fields.length > 0) result[cat] = { 'core-values': fields };
    } else {
      const rubric = team.rubrics[cat.replace('-', '_') as keyof typeof team.rubrics];
      const schema = rubrics[cat as JudgingCategory];
      if (rubric?.data?.fields && schema.sections) {
        const sections: SectionFields = {};
        schema.sections.forEach(section => {
          const sectionFields = section.fields
            .filter(field => rubric.data?.fields?.[field.id])
            .map(field => ({
              fieldId: field.id,
              value: rubric.data?.fields?.[field.id]?.value ?? null,
              color: getFieldComparisonColor(field.id, team.id, fieldComparisons)
            }));
          if (sectionFields.length > 0) sections[section.id] = sectionFields;
        });
        if (Object.keys(sections).length > 0) result[cat] = sections;
      }
    }
  });
  return result;
};

interface CategoryScoreCardProps {
  cat: string;
  sections: SectionFields;
  getCategory: (category: string) => string;
}

const CategoryScoreCard = ({ cat, sections, getCategory }: CategoryScoreCardProps) => (
  <Paper
    sx={{
      p: 1.5,
      bgcolor: getCategoryBgColor(cat),
      border: `2px solid ${getCategoryColor(cat)}`,
      borderRadius: 2,
      height: '100%'
    }}
  >
    <Typography
      variant="body2"
      sx={{
        fontSize: '0.95rem',
        fontWeight: 700,
        color: getCategoryColor(cat),
        textAlign: 'center',
        mb: 1,
        display: 'block'
      }}
    >
      {getCategory(cat)}
    </Typography>
    <Stack spacing={cat === 'core-values' ? 1.5 : 0.5}>
      {Object.entries(sections).map(([sectionId, scores]) => (
        <SectionScoreRow
          key={sectionId}
          category={cat as JudgingCategory}
          sectionId={sectionId}
          scores={scores}
          showSectionName={cat !== 'core-values'}
          showAllScores={cat === 'core-values'}
        />
      ))}
    </Stack>
  </Paper>
);

export const RubricScores = ({ team }: RubricScoresProps) => {
  const t = useTranslations('layouts.deliberation.compare');
  const { getCategory } = useJudgingCategoryTranslations();
  const { fieldComparisons, category } = useCompareContext();

  const fieldsBySections = useMemo(
    () => processFieldsBySections(team, fieldComparisons, category),
    [team, fieldComparisons, category]
  );

  const hasAnyFields = Object.values(fieldsBySections).some(sections =>
    Object.values(sections as SectionFields).some(
      fields => Array.isArray(fields) && fields.length > 0
    )
  );

  if (!hasAnyFields) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {t('no-rubric-data')}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
        {t('rubric-scores')}
      </Typography>

      {category ? (
        <Paper
          sx={{
            p: 1.5,
            bgcolor: getCategoryBgColor(category),
            border: `2px solid ${getCategoryColor(category)}`,
            borderRadius: 2,
            maxHeight: 300,
            overflowY: 'auto'
          }}
        >
          <Stack spacing={0.5}>
            {Object.entries(fieldsBySections[category] || {}).map(([sectionId, scores]) => (
              <SectionScoreRow
                key={sectionId}
                category={category as JudgingCategory}
                sectionId={sectionId}
                scores={scores}
                showSectionName={category !== 'core-values'}
                showAllScores={category === 'core-values'}
              />
            ))}
          </Stack>
        </Paper>
      ) : (
        <Grid container spacing={1}>
          {Object.entries(fieldsBySections).map(([cat, sections]) =>
            Object.keys(sections as SectionFields).length > 0 ? (
              <Grid size={4} key={cat}>
                <CategoryScoreCard cat={cat} sections={sections} getCategory={getCategory} />
              </Grid>
            ) : null
          )}
        </Grid>
      )}
    </Stack>
  );
};
