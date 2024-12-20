import React from 'react';
import { Box, Table, TableCell, TableRow, TableBody, Typography } from '@mui/material';
import { WithId } from 'mongodb';
import { JudgingCategory, Rubric } from '@lems/types';

interface ExportCRSummaryProps {
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

const colors = {
  'core-values': '#EBB3AA',
  'innovation-project': '#D3DAEC',
  'robot-design': '#DDE8D9'
};

const feedbackSections = [
  {
    title: 'ערכי הליבה',
    color: colors['core-values'],
    category: 'core-values' as JudgingCategory,
    question: 'כיצד הקבוצה הדגימה עבודת צוות, גילוי, הכלה, חדשנות, השפעה והנאה בעבודתה?'
  },
  {
    title: 'פרויקט החדשנות',
    color: colors['innovation-project'],
    category: 'innovation-project' as JudgingCategory,
    question: 'כיצד הקבוצה זיהתה בעיה הקשורה לנושא של עונה וניגשה לפתור אותה?'
  },
  {
    title: 'תכנון הרובוט',
    color: colors['robot-design'],
    category: 'robot-design' as JudgingCategory,
    question: 'מה היתה גישת הקבוצה לפתרון משימות הרובוט בצורה בנויה ותכנית?'
  }
];

export const SessionFeedbackTable: React.FC<ExportCRSummaryProps> = ({ rubrics }) => {
  const getFeedback = (category: JudgingCategory) => {
    const rubric = rubrics.find(r => r.category === category);
    return {
      greatJob: rubric?.data?.feedback?.greatJob || '',
      thinkAbout: rubric?.data?.feedback?.thinkAbout || ''
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
          border: '0.5px, solid #000'
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
              חשבו על...
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
              עבודה מצוינת...
            </Typography>
          </TableCell>
        </TableRow>
        {feedbackSections.map(section => {
          const feedback = getFeedback(section.category);
          return (
            <React.Fragment key={section.title}>
              <TableRow>
                <TableCell
                  colSpan={2}
                  align="left"
                  sx={{
                    backgroundColor: section.color,
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
                      {section.title}
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
                      {section.question}
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

export default SessionFeedbackTable;
