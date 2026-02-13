'use client';

import React from 'react';
import { Typography, Table, TableBody, TableRow, TableCell, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { JUDGING_CATEGORIES } from '@lems/types/judging';
import { Rubric } from '../types';

const categoryColors = {
  'core-values': '#EBB3AA',
  'innovation-project': '#D3DAEC',
  'robot-design': '#DDE8D9'
};

interface CombinedFeedbackTableProps {
  rubrics: Rubric[];
}

export const CombinedFeedbackTable: React.FC<CombinedFeedbackTableProps> = ({ rubrics }) => {
  const t = useTranslations('pages.exports.rubrics.feedback');
  const { getFeedbackTitle } = useRubricsGeneralTranslations();

  const getFeedback = (category: string) => {
    const rubric = rubrics.find(r => r.category === category);
    return {
      greatJob: rubric?.feedback?.greatJob || '',
      thinkAbout: rubric?.feedback?.thinkAbout || ''
    };
  };

  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        border: '0.5px solid #000',
        pageBreakInside: 'avoid',
        backgroundColor: 'white',
        '@media print': {
          borderRadius: '15px',
          border: '0.5px solid #000'
        },
        mt: 4
      }}
    >
      <Table
        sx={{
          tableLayout: 'fixed',
          borderCollapse: 'collapse',
          width: '100%',
          backgroundColor: 'white',
          '& .MuiTableCell-root': {
            border: '0.3px solid #666',
            p: 1,
            '@media print': {
              border: '0.1px solid grey'
            }
          }
        }}
      >
        <TableBody>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                width: '50%',
                backgroundColor: '#f8f9fa',
                py: 1,
                '@media print': {
                  backgroundColor: '#f8f9fa',
                  py: 0,
                  height: '12px',
                  minHeight: '12px',
                  maxHeight: '12px',
                  lineHeight: '12px',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }
              }}
            >
              <Typography
                fontWeight={600}
                sx={{
                  '@media print': {
                    lineHeight: '12px',
                    height: '12px'
                  }
                }}
              >
                {getFeedbackTitle('thinkAbout')}
              </Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '50%',
                backgroundColor: '#f8f9fa',
                py: 1,
                '@media print': {
                  backgroundColor: '#f8f9fa',
                  py: 0,
                  height: '12px',
                  minHeight: '12px',
                  maxHeight: '12px',
                  lineHeight: '12px',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }
              }}
            >
              <Typography
                fontWeight={600}
                sx={{
                  '@media print': {
                    lineHeight: '12px',
                    height: '12px'
                  }
                }}
              >
                {getFeedbackTitle('greatJob')}
              </Typography>
            </TableCell>
          </TableRow>

          {JUDGING_CATEGORIES.map(category => {
            const feedback = getFeedback(category);
            return (
              <React.Fragment key={category}>
                <TableRow>
                  <TableCell
                    colSpan={2}
                    align="left"
                    sx={{
                      backgroundColor: categoryColors[category],
                      border: '1px solid #000',
                      boxSizing: 'border-box',
                      fontSize: '1.4em',
                      py: '0.3em',
                      px: '1em',
                      '@media print': {
                        border: '0.1px solid black',
                        py: 0,
                        height: '12px',
                        minHeight: '12px',
                        maxHeight: '12px',
                        lineHeight: '12px',
                        px: '0.25em',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact'
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        '@media print': {
                          lineHeight: '12px',
                          height: '12px'
                        }
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 700,
                          '@media print': {
                            lineHeight: '12px',
                            height: '12px'
                          }
                        }}
                      >
                        {t(`categories.${category}`)}
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.9em',
                          '@media print': {
                            lineHeight: '12px',
                            height: '12px'
                          }
                        }}
                      >
                        {' - '}
                        {t(`category-descriptions.${category}`)}
                      </Box>
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: '#fff',
                      border: '1px solid #000',
                      boxSizing: 'border-box',
                      fontSize: '1.4em',
                      py: '3em',
                      px: '1em',
                      '@media print': {
                        border: '0.1px solid grey',
                        py: 0,
                        pt: '0.5em',
                        px: '0.25em',
                        height: '100px',
                        verticalAlign: 'top'
                      }
                    }}
                  >
                    <Typography>{feedback.thinkAbout}</Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: '#fff',
                      border: '1px solid #000',
                      boxSizing: 'border-box',
                      fontSize: '1.4em',
                      py: '3em',
                      px: '1em',
                      '@media print': {
                        border: '0.1px solid grey',
                        py: 0,
                        pt: '0.5em',
                        px: '0.25em',
                        height: '100px',
                        verticalAlign: 'top'
                      }
                    }}
                  >
                    <Typography>{feedback.greatJob}</Typography>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};
