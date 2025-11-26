'use client';

import { useRubricsGeneralTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types';
import { TableRow, TableCell, Typography, TextField } from '@mui/material';
import { useRubricContext } from '../rubric-context';

interface FeedbackRowProps {
  category: JudgingCategory;
  disabled?: boolean;
}

const colors: { [key: string]: string } = {
  'core-values': '#F5DAD4',
  'innovation-project': '#D3DAED',
  'robot-design': '#DAE8D8'
};

const feedbackFields = ['great-job', 'think-about'] as const;

export const FeedbackRow: React.FC<FeedbackRowProps> = ({ category, disabled }) => {
  const { getFeedbackTitle } = useRubricsGeneralTranslations();
  const { rubric, updateRubric } = useRubricContext();

  const handleFeedbackUpdate = async (field: 'great-job' | 'think-about', value: string) => {
    const feedback = {
      'great-job': rubric.values.feedback?.['great-job'] || '',
      'think-about': rubric.values.feedback?.['think-about'] || ''
    };

    const updatedValues = {
      ...rubric.values,
      feedback: {
        ...feedback,
        [field]: value || ''
      }
    };

    await updateRubric(updatedValues);
  };

  return (
    <>
      <TableRow>
        {feedbackFields.map((field, index) => (
          <TableCell
            key={field}
            colSpan={2}
            align="center"
            sx={{
              backgroundColor: colors[category],
              padding: '0.75em',
              fontWeight: 600,
              borderRight: index === 0 ? '1px solid rgba(0,0,0,0.2)' : 'none',
              '@media print': {
                border: '1px solid #000',
                py: '0.5em',
                px: '0.25em',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }
            }}
          >
            <Typography fontWeight={600}>{getFeedbackTitle(field)}...</Typography>
          </TableCell>
        ))}
      </TableRow>

      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            padding: '0px',
            '&:first-of-type': {
              borderRadius: '0 0 0 12px'
            },
            '&:last-of-type': {
              borderRadius: '0 0 12px 0'
            }
          }
        }}
      >
        {feedbackFields.map((field, index) => (
          <TableCell
            key={field}
            colSpan={2}
            sx={{
              borderRight: index === 0 ? '1px solid' : 'none',
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
              padding: '0.75em'
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder={getFeedbackTitle(field)}
              variant="standard"
              disabled={disabled}
              value={rubric.values.feedback?.[field] ?? ''}
              onChange={e => handleFeedbackUpdate(field, e.target.value)}
              sx={{
                p: 1,
                borderRadius: '12px',
                '& .MuiInput-root': {
                  '&::before': {
                    display: 'none'
                  },
                  '&::after': {
                    display: 'none'
                  }
                }
              }}
            />
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};
