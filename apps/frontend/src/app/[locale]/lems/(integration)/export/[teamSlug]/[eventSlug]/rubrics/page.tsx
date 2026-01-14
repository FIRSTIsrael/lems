'use client';

import { useMemo, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';
import { rubrics as rubricSchemas } from '@lems/shared/rubrics';
import Image from 'next/image';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { ExportRubricTable } from './components/export-rubric-table';
import { CombinedFeedbackTable } from './components/combined-feedback-table';
import { GET_TEAM_INFO_QUERY, GET_RUBRICS_QUERY, RubricInfo } from './graphql/query';

interface RubricsExportPageProps {
  params: Promise<{
    locale: string;
    teamSlug: string;
    eventSlug: string;
  }>;
}

export default function RubricsExportPage({ params: paramsPromise }: RubricsExportPageProps) {
  const params = use(paramsPromise);
  const t = useTranslations('pages.exports.rubrics');
  const { getTerm } = useRubricsGeneralTranslations();
  const teamSlugUpper = params.teamSlug.toUpperCase();

  const {
    data: teamInfoData,
    loading: teamInfoLoading,
    error: teamInfoError
  } = useQuery(GET_TEAM_INFO_QUERY, {
    variables: {
      eventSlug: params.eventSlug,
      teamSlug: teamSlugUpper
    },
    fetchPolicy: 'no-cache'
  });

  const divisions = teamInfoData?.event?.divisions || [];
  const division = divisions.find(div => div.teams?.length > 0);
  const team = division?.teams?.[0];
  const divisionId = division?.id;
  const teamId = team?.id;

  const teamNotFound = teamInfoData?.event && divisions.length > 0 && !team;

  const {
    data: rubricsData,
    loading: rubricsLoading,
    error: rubricsError
  } = useQuery(GET_RUBRICS_QUERY, {
    variables: { divisionId: divisionId!, teamId: teamId! },
    skip: !divisionId || !teamId || teamNotFound,
    fetchPolicy: 'no-cache'
  });

  let rubrics: Array<{
    divisionName: string;
    teamNumber: number;
    teamName: string;
    rubricCategory: string;
    seasonName: string;
    eventName: string;
    scores: Record<string, number>;
    status: string;
    feedback: { greatJob: string; thinkAbout: string };
    schema: any;
  }> = [];
  if (rubricsData?.division && team && teamInfoData?.event) {
    const divisionData = rubricsData.division;
    rubrics = divisionData.judging.rubrics.map((rubric: RubricInfo) => {
      const categoryKey = rubric.category.replace(/_/g, '-') as JudgingCategory;
      const schema = rubricSchemas[categoryKey];

      const fields = rubric.data?.fields || {};
      const scores: Record<string, number> = {};
      Object.entries(fields).forEach(([fieldId, fieldData]) => {
        if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
          const fieldValue = (fieldData as { value: number | null }).value;
          if (fieldValue !== null) {
            scores[fieldId] = fieldValue;
          }
        }
      });

      return {
        divisionName: divisionData.name,
        teamNumber: team.number,
        teamName: team.name,
        rubricCategory: categoryKey,
        seasonName: '',
        eventName: teamInfoData.event.name,
        scores: scores,
        status: rubric.status,
        feedback: rubric.data?.feedback || { greatJob: '', thinkAbout: '' },
        schema: schema
      };
    });
  }

  const optionalAwards = useMemo(() => {
    return rubricsData?.division?.judging?.awards || [];
  }, [rubricsData]);

  const loading = teamInfoLoading || rubricsLoading;
  const error = teamInfoError?.message || rubricsError?.message || '';

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (teamNotFound || !team) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {t('team-not-found', { teamSlug: teamSlugUpper, eventSlug: params.eventSlug })}
        </Alert>
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
