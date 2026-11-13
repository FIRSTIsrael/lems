'use client';

import { useRubricsGeneralTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';
import { getRubricColors } from '@lems/shared/rubrics';
import { TableRow, TableCell, Typography, TextField } from '@mui/material';
import { useToolEdition } from '../../../hooks/use-tool-edition';
import { useRubricContext } from '../rubric-context';

interface FeedbackRowProps {
  category: JudgingCategory;
  disabled?: boolean;
}

const feedbackFields = ['greatJob', 'thinkAbout'] as const;

export const FeedbackRow: React.FC<FeedbackRowProps> = ({ category, disabled }) => {
  const edition = useToolEdition();
  const { getFeedbackTitle } = useRubricsGeneralTranslations(edition);
  const { rubric, updateRubric } = useRubricContext();

  const handleFeedbackUpdate = async (field: 'greatJob' | 'thinkAbout', value: string) => {
    const feedback = {
      greatJob: rubric.values.feedback?.greatJob || '',
      thinkAbout: rubric.values.feedback?.thinkAbout || ''
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
              backgroundColor: getRubricColors(edition, category).section,
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
            <Typography
              sx={{
                fontWeight: 600
              }}
            >
              {getFeedbackTitle(field)}...
            </Typography>
          </TableCell>
        ))}
      </TableRow>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
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
