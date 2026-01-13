'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';
import Image from 'next/image';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { ExportRubricTable } from './components/export-rubric-table';
import { CombinedFeedbackTable } from './components/combined-feedback-table';

interface RubricSchema {
  sections: Array<{
    id: string;
    fields: Array<{ id: string; coreValues?: boolean }>;
  }>;
  feedback?: boolean;
}

export interface Rubric {
  divisionName: string;
  teamNumber: number;
  teamName: string;
  rubricCategory: string;
  seasonName: string;
  eventName: string;
  scores: Record<string, number | null>;
  status?: string;
  feedback?: { greatJob: string; thinkAbout: string };
  schema?: RubricSchema;
  translations?: {
    sections: Record<
      string,
      {
        title: string;
        description: string;
        fields: Record<
          string,
          {
            beginning: string;
            developing: string;
            accomplished: string;
          }
        >;
      }
    >;
  };
}

interface OptionalAward {
  id: string;
  name: string;
  description?: string;
}

interface RubricsExportPageProps {
  params: Promise<{
    locale: string;
    eventSlug: string;
    teamId: string;
  }>;
}

export default function RubricsExportPage({ params: paramsPromise }: RubricsExportPageProps) {
  const params = use(paramsPromise);
  const t = useTranslations('pages.exports.rubrics');
  const { getTerm } = useRubricsGeneralTranslations();
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [optionalAwards, setOptionalAwards] = useState<OptionalAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { eventSlug, teamId } = params;
        const response = await fetch(`/api/export/rubrics?eventSlug=${eventSlug}&teamId=${teamId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch rubrics');
        }

        const data = await response.json();
        setRubrics(data.rubrics || []);
        setOptionalAwards(data.optionalAwards || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rubrics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ '@media print': { margin: 0, padding: 0 } }}>
      {rubrics.length > 0 ? (
        <>
          {rubrics
            .filter(rubric => rubric.rubricCategory !== 'core-values')
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
                        eventName: rubric.eventName,
                        divisionName: rubric.divisionName,
                        seasonName: rubric.seasonName
                      })}
                    </Box>

                    <Box sx={{ fontSize: '1.3rem', fontWeight: 'bold', mb: 1 }}>
                      {t('title', {
                        category: getTerm(`categories.${rubric.rubricCategory}.title`),
                        teamNumber: rubric.teamNumber,
                        teamName: rubric.teamName
                      })}
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
                    category={rubric.rubricCategory as JudgingCategory}
                    scores={rubric.scores}
                    feedback={rubric.feedback}
                  />
                ) : (
                  <Alert severity="info">No rubric data available</Alert>
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
                      eventName: rubrics[0].eventName,
                      divisionName: rubrics[0].divisionName,
                      seasonName: rubrics[0].seasonName
                    })}
                </Box>

                <Box sx={{ fontSize: '1.3rem', fontWeight: 'bold', mb: 1 }}>
                  {rubrics[0] &&
                    t('feedback.page-title', {
                      teamNumber: rubrics[0].teamNumber,
                      teamName: rubrics[0].teamName
                    })}
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

              <Box
                sx={{
                  mt: 3,
                  textAlign: 'left',
                  '@media print': {
                    mt: 2
                  }
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.95em',
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    '@media print': {
                      fontSize: '0.85em'
                    }
                  }}
                >
                  {t('feedback.awards.description')}
                </Typography>
                {optionalAwards.length === 0 && (
                  <Typography
                    sx={{
                      fontSize: '0.9em',
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      mt: 1,
                      '@media print': {
                        fontSize: '0.8em'
                      }
                    }}
                  >
                    {t('feedback.awards.no-awards')}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Alert severity="info">{t('no-rubrics-found')}</Alert>
      )}
    </Box>
  );
}
