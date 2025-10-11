import { WithId } from 'mongodb';
import { JudgingCategory, Rubric } from '@lems/types';
import { Box, TableCell, TableRow, Typography } from '@mui/material';
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
    <>
      <TableRow>
        <TableCell
          colSpan={2}
          align="center"
          sx={{
            bgcolor: '#fff',
            border: '2px solid #000',
            boxSizing: 'border-box',
            fontSize: '1.4em',
            py: '1.5em',
            px: '1em',
            top: theme => theme.mixins.toolbar.minHeight,
            '@media print': {
              py: '0.5em',
              px: '0.25em',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }
          }}
        >
          <Typography py={0.75} fontWeight={600}>
            עבודה מצוינת...
          </Typography>
        </TableCell>
        <TableCell
          colSpan={2}
          align="center"
          sx={{ border: '2px solid #000', backgroundColor: '#fff' }}
        >
          <Typography py={0.75} fontWeight={600}>
            חשבו על...
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={4}
          sx={{
            border: '2px solid #000',
            backgroundColor: colors[rubric.category],
            py: 1,
            '@media print': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }
          }}
        >
          <Typography py={0.75}>
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
      <TableRow
        sx={{
          '@media print': {
            marginBottom: '2cm'
          }
        }}
      >
        <TableCell
          colSpan={2}
          sx={{
            border: '2px solid #000',
            backgroundColor: '#fff',
            p: 2,
            verticalAlign: 'top',
            minHeight: '150px',
            textAlign: 'right'
          }}
        >
          <Typography py={0.5} sx={{ textAlign: 'left' }}>
            {rubric.data?.feedback?.greatJob || ''}
          </Typography>
        </TableCell>
        <TableCell
          colSpan={2}
          sx={{
            border: '2px solid #000',
            backgroundColor: '#fff',
            p: 2,
            verticalAlign: 'top',
            minHeight: '150px',
            textAlign: 'right'
          }}
        >
          <Typography py={0.5} sx={{ textAlign: 'left' }}>
            {rubric.data?.feedback?.thinkAbout || ''}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
};
