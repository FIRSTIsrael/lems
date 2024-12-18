import { WithId } from 'mongodb';
import { JudgingCategory, Rubric } from '@lems/types';
import Grid from '@mui/material/Grid2';
import { Box, Table, TableCell, TableRow, Typography } from '@mui/material';
import { localizedJudgingCategory } from '@lems/season';

const colors = {
  'core-values': '#EBB3AA',
  'innovation-project': '#D3DAEC',
  'robot-design': '#DDE8D9'
};

const headerText = {
  'core-values': 'כיצד הקבוצה הדגימה עבודת צוות, גילוי, הכלה, חדשנות, השפעה והנאה בעבודתה?',
  'innovation-project': ' כיצד הקבוצה יזהתה בעיה הקשורה לנושא של עונה ותגשה לפתור אותה?',
  'robot-design': ' מה היתה גישת הקבוצה לפתרון משימות הרובוט בצורה בנויה ותכנית?'
};

interface RubricFeedbackProps {
  rubric: WithId<Rubric<JudgingCategory>>;
}

export const RubricFeedback: React.FC<RubricFeedbackProps> = ({ rubric }) => {
  return (
    <Grid size={12} sx={{ mt: -6 }}>
      <Box
        dir="rtl"
        sx={{
          width: '100%',
          transform: 'scale(0.9)',
          transformOrigin: 'top right',
          mt: rubric.category === 'core-values' ? 3 : -12,
          ml: -5
        }}
      >
        <Box
          dir="rtl"
          sx={{
            mt: 0,
            width: '103%',
            ml: -1,
            overflow: 'hidden',
            borderRadius: '8px',
            border: '2px solid #000',
            pageBreakInside: 'avoid',
            backgroundColor: 'white'
          }}
        >
          <Table
            sx={{
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
              width: '100%',
              backgroundColor: 'white'
            }}
          >
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  width: '50%',
                  borderBottom: '2px solid #000',
                  borderLeft: '2px solid #000',
                  borderRight: '2px solid #000',
                  backgroundColor: '#f8f9fa',
                  py: 1
                }}
              >
                <Typography fontWeight={600}>עבודה מצוינת...</Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  width: '50%',
                  borderBottom: '2px solid #000',
                  borderLeft: '2px solid #000',
                  backgroundColor: '#f8f9fa',
                  py: 1
                }}
              >
                <Typography fontWeight={600}>חשבו על...</Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                colSpan={2}
                sx={{
                  borderBottom: '2px solid #000',
                  backgroundColor: colors[rubric.category],
                  py: '0.75em',
                  '@media print': {
                    backgroundColor: colors[rubric.category],
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }
                }}
              >
                <Typography>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    {localizedJudgingCategory[rubric.category].name}
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.9em' }}>
                    {' - '}
                    {headerText[rubric.category]}
                  </Box>
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderLeft: '2px solid #000',
                  borderRight: '2px solid #000',
                  borderBottom: '2px solid #000',
                  p: 2,
                  verticalAlign: 'top',
                  minHeight: '150px',
                  textAlign: 'right'
                }}
              >
                <Typography sx={{ textAlign: 'left' }}>
                  {rubric.data?.feedback?.greatJob || ''}
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: '2px solid #000',
                  p: 2,
                  verticalAlign: 'top',
                  minHeight: '150px',
                  textAlign: 'right'
                }}
              >
                <Typography sx={{ textAlign: 'left' }}>
                  {rubric.data?.feedback?.thinkAbout || ''}
                </Typography>
              </TableCell>
            </TableRow>
          </Table>
        </Box>
      </Box>
    </Grid>
  );
};
