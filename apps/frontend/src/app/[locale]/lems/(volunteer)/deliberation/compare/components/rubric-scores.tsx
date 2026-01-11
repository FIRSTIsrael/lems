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
  type RubricField,
  type FieldComparisons
} from './rubric-scores-utils';
import { SectionScoreRow } from './section-score-row';

interface RubricScoresProps {
  team: Team;
}

const processFieldsBySections = (
  team: Team,
  fieldComparisons: FieldComparisons,
  category?: string
): Record<string, Record<string, RubricField[]>> => {
  const categories = category ? [category] : ['innovation-project', 'robot-design', 'core-values'];
  const result: Record<string, Record<string, RubricField[]>> = {};

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
            category: 'innovation-project' as const,
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
            category: 'robot-design' as const,
            value: field.value,
            color: getFieldComparisonColor(id, team.id, fieldComparisons, 'rd')
          }))
      ];
      if (fields.length > 0) result[cat] = { 'core-values': fields };
    } else {
      const rubric = team.rubrics[cat.replace('-', '_') as keyof typeof team.rubrics];
      const schema = rubrics[cat as JudgingCategory];
      const rubricData = rubric?.data;
      if (rubricData?.fields && schema.sections) {
        const sections: Record<string, RubricField[]> = {};
        schema.sections.forEach(section => {
          const sectionFields = section.fields
            .filter(field => rubricData.fields[field.id])
            .map(field => ({
              fieldId: field.id,
              category: cat,
              value: rubricData.fields[field.id].value,
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

const CategoryScoreCard = ({
  cat,
  sections,
  getCategory
}: {
  cat: string;
  sections: Record<string, RubricField[]>;
  getCategory: (category: JudgingCategory) => string;
}) => (
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
      {getCategory(cat as JudgingCategory)}
    </Typography>
    <Stack spacing={cat === 'core-values' ? 1.5 : 0.5}>
      {Object.entries(sections).map(([sectionId, scores]: [string, RubricField[]]) => (
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
    Object.values(sections).some(fields => fields.length > 0)
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
            Object.keys(sections).length > 0 ? (
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
