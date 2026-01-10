'use client';

import { useEffect, useState, use } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { ExportRubricTable } from './export-rubric-table';

interface RubricSchema {
  sections: Array<{
    id: string;
    fields: Array<{ id: string; coreValues?: boolean }>;
  }>;
  feedback?: boolean;
}

interface Rubric {
  divisionName: string;
  teamNumber: number;
  teamName: string;
  rubricCategory: string;
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

interface RubricsExportPageProps {
  params: Promise<{
    locale: string;
    eventSlug: string;
    teamId: string;
  }>;
}

export default function RubricsExportPage({ params: paramsPromise }: RubricsExportPageProps) {
  const params = use(paramsPromise);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const { eventSlug, teamId } = params;
        const response = await fetch(`/api/export/rubrics?eventSlug=${eventSlug}&teamId=${teamId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch rubrics');
        }

        const data = await response.json();
        setRubrics(data.rubrics || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rubrics');
      } finally {
        setLoading(false);
      }
    };

    fetchRubrics();
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
        rubrics.map((rubric, index) => (
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
            <Box sx={{ mb: 2, textAlign: 'right' }}>
              <Box sx={{ fontSize: '0.95rem' }}>
                {rubric.teamName} - #{rubric.teamNumber}
              </Box>
              <Box sx={{ fontSize: '0.85rem', color: '#666' }}>{rubric.rubricCategory}</Box>
            </Box>

            {rubric.schema && rubric.schema.sections && rubric.schema.sections.length > 0 ? (
              <ExportRubricTable
                sections={rubric.schema.sections}
                category={rubric.rubricCategory as any}
                scores={rubric.scores}
                feedback={rubric.feedback}
              />
            ) : (
              <Alert severity="info">No rubric data available</Alert>
            )}
          </Box>
        ))
      ) : (
        <Alert severity="info">No rubrics found</Alert>
      )}
    </Box>
  );
}
