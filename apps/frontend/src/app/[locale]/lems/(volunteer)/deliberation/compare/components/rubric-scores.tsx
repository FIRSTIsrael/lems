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

function processFieldsBySections(
  team: Team,
  fieldComparisons: FieldComparisons,
  category?: string
): Record<
  string,
  Record<
    string,
    Array<{ fieldId: string; value: number | null; color: 'success' | 'error' | 'default' }>
  >
> {
  const categories = category ? [category] : ['innovation-project', 'robot-design', 'core-values'];
  const result: Record<
    string,
    Record<
      string,
      Array<{ fieldId: string; value: number | null; color: 'success' | 'error' | 'default' }>
    >
  > = {};

  categories.forEach(cat => {
    if (cat === 'core-values') {
      const ipRubric = team.rubrics.innovation_project;
      const rdRubric = team.rubrics.robot_design;
      const coreValuesFields: Array<{
        fieldId: string;
        value: number | null;
        color: 'success' | 'error' | 'default';
      }> = [];

      [
        { rubric: ipRubric, schema: rubrics['innovation-project'], prefix: 'ip' },
        { rubric: rdRubric, schema: rubrics['robot-design'], prefix: 'rd' }
      ].forEach(({ rubric, schema, prefix }) => {
        if (rubric?.data?.fields && schema.sections) {
          schema.sections.forEach(section => {
            section.fields.forEach(field => {
              if (field.coreValues && rubric.data.fields[field.id]) {
                const color = getFieldComparisonColor(field.id, team.id, fieldComparisons, prefix);
                coreValuesFields.push({
                  fieldId: field.id,
                  value: rubric.data.fields[field.id].value,
                  color
                });
              }
            });
          });
        }
      });

      if (coreValuesFields.length > 0) {
        result[cat] = { 'core-values': coreValuesFields };
      }
    } else {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      const rubric = team.rubrics[rubricKey];
      const schema = rubrics[cat as JudgingCategory];

      if (rubric?.data?.fields && schema.sections) {
        result[cat] = {};

        schema.sections.forEach(section => {
          const sectionFields: Array<{
            fieldId: string;
            value: number | null;
            color: 'success' | 'error' | 'default';
          }> = [];

          section.fields.forEach(field => {
            if (rubric.data.fields[field.id]) {
              const color = getFieldComparisonColor(field.id, team.id, fieldComparisons);
              sectionFields.push({
                fieldId: field.id,
                value: rubric.data.fields[field.id].value,
                color
              });
            }
          });

          if (sectionFields.length > 0) {
            result[cat][section.id] = sectionFields;
          }
        });
      }
    }
  });

  return result;
}

export function RubricScores({ team }: RubricScoresProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const { getCategory } = useJudgingCategoryTranslations();
  const { fieldComparisons, category } = useCompareContext();

  const fieldsBySections = useMemo(() => {
    return processFieldsBySections(team, fieldComparisons, category);
  }, [team, fieldComparisons, category]);

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
          {Object.entries(fieldsBySections).map(([cat, sections]) => {
            if (Object.keys(sections).length === 0) return null;

            return (
              <Grid size={4} key={cat}>
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
                    {getCategory(cat as 'innovation-project' | 'robot-design' | 'core-values')}
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
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
