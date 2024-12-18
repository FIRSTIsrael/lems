import React from 'react';
import { Box, Table, TableCell, TableRow, Typography } from '@mui/material';
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
  // Get feedback for each category
  const getFeedback = (category: JudgingCategory) => {
    const rubric = rubrics.find(r => r.category === category);
    return {
      greatJob: rubric?.data?.feedback?.greatJob || '',
      thinkAbout: rubric?.data?.feedback?.thinkAbout || ''
    };
  };

  return (
    <Box
      dir="rtl"
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        border: '2px solid #000',
        pageBreakInside: 'avoid',
        backgroundColor: 'white',
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
            border: '2px solid black',
            p: 2
          }
        }}
      >
        <TableRow>
          <TableCell
            align="center"
            sx={{
              width: '50%',
              backgroundColor: '#f8f9fa',
              py: 1,
              '@media print': {
                backgroundColor: '#f8f9fa',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }
            }}
          >
            <Typography fontWeight={600}>חשבו על...</Typography>
          </TableCell>
          <TableCell
            align="center"
            sx={{
              width: '50%',
              backgroundColor: '#f8f9fa',
              py: 1,
              '@media print': {
                backgroundColor: '#f8f9fa',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }
            }}
          >
            <Typography fontWeight={600}>עבודה מצוינת...</Typography>
          </TableCell>
        </TableRow>
        {feedbackSections.map((section) => {
          const feedback = getFeedback(section.category);
          return (
            <React.Fragment key={section.title}>
              <TableRow>
                <TableCell
                  colSpan={2}
                  sx={{
                    backgroundColor: section.color,
                    py: '0.75em',
                    '@media print': {
                      backgroundColor: `${section.color} !important`,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact'
                    }
                  }}
                >
                  <Typography>
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {section.title}
                    </Box>
                    <Box component="span" sx={{ fontSize: '0.9em' }}>
                      {' - '}
                      {section.question}
                    </Box>
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>
                    {feedback.thinkAbout}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {feedback.greatJob}
                  </Typography>
                </TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}
      </Table>
    </Box>
  );
};

export default SessionFeedbackTable;
