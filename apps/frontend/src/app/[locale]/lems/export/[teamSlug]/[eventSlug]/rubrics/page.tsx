'use client';

import { useTranslations } from 'next-intl';
import { useRubricsGeneralTranslations, useAwardTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';
import { rubrics as rubricSchemas } from '@lems/shared/rubrics';
import Image from 'next/image';
import { Box, Alert, Typography, Paper, Stack, Checkbox, FormControlLabel } from '@mui/material';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { ExportRubricTable } from './components/export-rubric-table';
import { CombinedFeedbackTable } from './components/combined-feedback-table';

interface RubricData {
  id: string;
  category: JudgingCategory;
  data?: {
    awards?: Record<string, boolean>;
    fields: Record<string, { value: 1 | 2 | 3 | 4 | null; notes?: string }>;
    feedback?: { greatJob: string; thinkAbout: string };
  };
}

interface RubricsPageData {
  teamNumber: number;
  teamName: string;
  teamLogoUrl: string | null;
  eventName: string;
  divisionName: string;
  seasonName: string;
  rubrics: RubricData[];
  awards: Record<string, boolean>;
}

export default function RubricsExportPage() {
  const params = useParams();
  const t = useTranslations('pages.exports.rubrics');
  const { getTerm } = useRubricsGeneralTranslations();
  const { getName: getAwardName, getDescription: getAwardDescription } = useAwardTranslations();

  const { data: rubricsData } = useSWR<RubricsPageData>(
    `/lems/export/${params.teamSlug}/${params.eventSlug}/rubrics`
  );

  if (!rubricsData) {
    return null;
  }

  const rubrics = rubricsData.rubrics.map(rubric => {
    const categoryKey = rubric.category.replace(/_/g, '-') as JudgingCategory;
    const schema = rubricSchemas[categoryKey];

    const fields = rubric.data?.fields || {};
    const scores: Record<string, number> = {};
    const notes: Record<string, string> = {};
    Object.entries(fields).forEach(([fieldId, fieldData]) => {
      if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
        const fieldValue = (fieldData as { value: number | null }).value;
        const fieldNotes = (fieldData as { notes?: string | null }).notes;

        if (fieldValue !== null) {
          scores[fieldId] = fieldValue;
        }

        if (fieldValue === 4 && fieldNotes) {
          notes[fieldId] = fieldNotes;
        }
      }
    });

    return {
      scores: scores,
      notes,
      category: rubric.category,
      feedback: rubric.data?.feedback || { greatJob: '', thinkAbout: '' },
      awards: rubric.data?.awards || {},
      schema: schema
    };
  });

  return (
    <Box sx={{ '@media print': { margin: 0, padding: 0 } }}>
      {rubrics.length > 0 ? (
        <>
          {rubrics
            .filter(rubric => rubric.category !== 'core-values')
            .map((rubric, index) => (
              <Box
                key={index}
                component="section"
                sx={{
                  pageBreakInside: 'avoid !important',
                  breakInside: 'avoid !important',
                  p: 2,
                  '@media print': {
                    margin: 0,
                    padding: 2,
                    pageBreakAfter: 'always'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid #000',
                    '@media print': {
                      mb: 2,
                      pb: 1
                    }
                  }}
                >
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Box sx={{ fontSize: '0.7rem', color: '#666', mb: 1, lineHeight: 1.3 }}>
                      {t('metadata', {
                        eventName: rubricsData.eventName,
                        divisionName: rubricsData.divisionName,
                        seasonName: rubricsData.seasonName
                      })}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Image
                        src={rubricsData.teamLogoUrl ?? '/assets/default-avatar.svg'}
                        alt={`Team ${rubricsData.teamNumber}`}
                        width={48}
                        height={48}
                        style={{ objectFit: 'cover' }}
                      />
                      <Box sx={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {t('title', {
                          category: getTerm(`categories.${rubric.category}.title`),
                          teamNumber: rubricsData.teamNumber,
                          teamName: rubricsData.teamName
                        })}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ width: '100px', height: '80px', position: 'relative', flexShrink: 0 }}>
                    <Image
                      src="/assets/audience-display/sponsors/fllc-horizontal.svg"
                      alt="FIRST LEGO League Challenge"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </Box>

                {rubric.schema && rubric.schema.sections && rubric.schema.sections.length > 0 ? (
                  <ExportRubricTable
                    sections={rubric.schema.sections}
                    category={rubric.category as JudgingCategory}
                    scores={rubric.scores}
                    notes={rubric.notes}
                    feedback={rubric.feedback}
                  />
                ) : (
                  <Alert severity="info">{t('no-rubric-data')}</Alert>
                )}
              </Box>
            ))}

          <Box
            sx={{
              p: 2,
              '@media print': {
                pageBreakBefore: 'always',
                margin: 0,
                padding: 2
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 3,
                pb: 2,
                borderBottom: '2px solid #000',
                '@media print': {
                  mb: 2,
                  pb: 1
                }
              }}
            >
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Box sx={{ fontSize: '0.7rem', color: '#666', mb: 1, lineHeight: 1.3 }}>
                  {rubrics[0] &&
                    t('metadata', {
                      eventName: rubricsData.eventName,
                      divisionName: rubricsData.divisionName,
                      seasonName: rubricsData.seasonName
                    })}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Image
                    src={rubricsData.teamLogoUrl ?? '/assets/default-avatar.svg'}
                    alt={`Team ${rubricsData.teamNumber}`}
                    width={48}
                    height={48}
                    style={{ objectFit: 'cover' }}
                  />
                  <Box sx={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {t('feedback.page-title', {
                      teamNumber: rubricsData.teamNumber,
                      teamName: rubricsData.teamName
                    })}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ width: '100px', height: '80px', position: 'relative', flexShrink: 0 }}>
                <Image
                  src="/assets/audience-display/sponsors/fllc-horizontal.svg"
                  alt="FIRST LEGO League Challenge"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Box>

            <Box sx={{ width: '90%', ml: 5 }}>
              <CombinedFeedbackTable rubrics={rubrics} />

              <Paper
                sx={{
                  p: 0.75,
                  borderRadius: 0,
                  boxShadow: 'none',
                  mt: 2,
                  '@media print': {
                    boxShadow: 'none',
                    p: 0.75,
                    mt: 1.5,
                    border: 'none'
                  }
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="h4" fontSize="1rem" fontWeight={600}>
                    {t('feedback.awards.title')}
                  </Typography>

                  <Stack spacing={0.5}>
                    {Object.entries(rubricsData.awards).length === 0 ? (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontStyle: 'italic', fontSize: '0.875rem' }}
                      >
                        {t('feedback.awards.no-awards')}
                      </Typography>
                    ) : (
                      Object.entries(rubricsData.awards).map(([awardName, nominated]) => (
                        <Stack key={awardName} spacing={0.25}>
                          <FormControlLabel
                            control={<Checkbox size="small" checked={nominated} />}
                            label={
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ fontSize: '0.875rem' }}
                              >
                                {getAwardName(awardName)}
                              </Typography>
                            }
                            sx={{ m: 0 }}
                          />
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ pl: 3, fontSize: '0.75rem' }}
                          >
                            {getAwardDescription(awardName)}
                          </Typography>
                        </Stack>
                      ))
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          </Box>
        </>
      ) : (
        <Alert severity="info">{t('no-rubrics-found')}</Alert>
      )}
    </Box>
  );
}
