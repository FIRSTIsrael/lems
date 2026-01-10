'use client';

import { useEffect, useState, use } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Grid,
  FormControlLabel,
  Radio
} from '@mui/material';

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
    <Box>
      {rubrics.length > 0 ? (
        rubrics.map((rubric, index) => (
          <Box
            key={index}
            component="section"
            sx={{
              pageBreakInside: 'avoid !important',
              breakInside: 'avoid !important',
              position: 'relative',
              boxSizing: 'border-box',
              '@media print': {
                margin: '0',
                padding: '0',
                maxHeight: '100vh',
                overflow: 'hidden'
              }
            }}
          >
            <Stack spacing={0} sx={{ height: '100%' }}>
              <Grid container sx={{ p: 2 }}>
                <Grid size={10}>
                  <Stack justifyContent="space-between" height="100%" spacing={0.5}>
                    <Typography fontSize="0.65rem" color="textSecondary">
                      Team #{rubric.teamNumber} - {rubric.teamName} | {rubric.divisionName}
                    </Typography>
                    <Typography fontSize="1.5rem" fontWeight={700}>
                      {rubric.rubricCategory}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {rubric.schema && rubric.schema.sections && rubric.schema.sections.length > 0 ? (
                  <Box
                    dir="rtl"
                    sx={{
                      width: '115%',
                      mt: 1,
                      mb: -5,
                      mr: -3,
                      ml: -7,
                      '@media print': {
                        height: 'fit-content',
                        overflow: 'hidden',
                        pageBreakInside: 'avoid !important',
                        breakInside: 'avoid !important'
                      }
                    }}
                  >
                    <Table
                      sx={{
                        tableLayout: 'fixed',
                        borderCollapse: 'collapse',
                        maxWidth: '100%',
                        width: '100%',
                        position: 'relative',
                        border: '2px solid #000',
                        transform: 'scale(0.75)',
                        transformOrigin: 'top center',
                        '@media print': {
                          width: '100%',
                          tableLayout: 'fixed',
                          pageBreakInside: 'avoid !important',
                          breakInside: 'avoid !important'
                        },
                        '& .MuiTableCell-root': {
                          padding: '3px 6px',
                          fontSize: '0.85rem',
                          lineHeight: 1.2,
                          height: 'auto'
                        },
                        '& .MuiTableHead-root .MuiTableCell-root': {
                          padding: '1em',
                          fontSize: '1em'
                        },
                        '& .MuiTypography-root': {
                          fontSize: '0.85rem',
                          lineHeight: 1.2
                        },
                        '& .MuiTableHead-root .MuiTypography-root': {
                          fontSize: '1em'
                        },
                        '& .MuiTableRow-root': {
                          minHeight: 'unset',
                          height: 'auto'
                        }
                      }}
                    >
                      <TableHead sx={{ p: '0.5rem 0.25rem' }}>
                        <TableRow>
                          <TableCell sx={{ border: '2px solid #000', textAlign: 'center' }}>
                            Beginning
                          </TableCell>
                          <TableCell sx={{ border: '2px solid #000', textAlign: 'center' }}>
                            Developing
                          </TableCell>
                          <TableCell sx={{ border: '2px solid #000', textAlign: 'center' }}>
                            Accomplished
                          </TableCell>
                          <TableCell sx={{ border: '2px solid #000', textAlign: 'center' }}>
                            Exceeds
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {rubric.schema.sections.map(section => (
                        <TableBody key={section.id}>
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              sx={{
                                border: '2px solid #000',
                                backgroundColor: '#e8f0f7',
                                fontWeight: 'bold',
                                textAlign: 'right'
                              }}
                            >
                              {section.id}
                            </TableCell>
                          </TableRow>
                          {section.fields.map(field => (
                            <TableRow key={field.id}>
                              {[1, 2, 3, 4].map(level => (
                                <TableCell
                                  key={level}
                                  sx={{
                                    border: '2px solid #000',
                                    fontSize: '0.7rem',
                                    p: '0 0.5em',
                                    backgroundColor:
                                      rubric.scores[field.id] === level ? '#d4edda' : '#fff'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      width: '100%',
                                      minHeight: '2.5rem'
                                    }}
                                  >
                                    <FormControlLabel
                                      value={level}
                                      control={
                                        <Radio
                                          disableRipple
                                          checked={rubric.scores[field.id] === level}
                                          sx={{ fontSize: '1.7em' }}
                                        />
                                      }
                                      label=""
                                      sx={{
                                        m: 0,
                                        '.MuiFormControlLabel-label': { display: 'none' }
                                      }}
                                    />
                                  </Box>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      ))}
                    </Table>
                  </Box>
                ) : (
                  <Alert severity="info">No rubric structure available</Alert>
                )}
              </Box>
            </Stack>
          </Box>
        ))
      ) : (
        <Alert severity="info">No rubrics found</Alert>
      )}
      <Box sx={{ '@media print': { pageBreakAfter: 'always' } }} />
    </Box>
  );
}
