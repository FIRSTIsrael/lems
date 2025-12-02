'use client';

import { useState, useCallback, useEffect } from 'react';
import { TableRow, TableCell, Typography, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';
import { useRubric } from '../rubric-context';

interface FeedbackRowProps {
  category: JudgingCategory;
  disabled?: boolean;
}

const colors: { [key: string]: string } = {
  'core-values': '#F5DAD4',
  'innovation-project': '#D3DAED',
  'robot-design': '#DAE8D8'
};

const feedbackFields = ['greatJob', 'thinkAbout'] as const;

export const FeedbackRow: React.FC<FeedbackRowProps> = ({ category, disabled = false }) => {
  const t = useTranslations('pages.rubric');

  const { getFeedbackTitle } = useRubricsGeneralTranslations();
  const { rubric, updateFeedback } = useRubric();

  const [feedback, setFeedback] = useState(
    rubric.data?.feedback || {
      greatJob: '',
      thinkAbout: ''
    }
  );

  // Sync local state with context changes (e.g., from subscriptions)
  useEffect(() => {
    setFeedback({
      greatJob: rubric.data?.feedback?.greatJob || '',
      thinkAbout: rubric.data?.feedback?.thinkAbout || ''
    });
  }, [rubric.data?.feedback?.greatJob, rubric.data?.feedback?.thinkAbout]);

  const handleFeedbackBlur = useCallback(
    (field: 'greatJob' | 'thinkAbout', value: string) => {
      const contextGreatJob = rubric.data?.feedback?.greatJob || '';
      const contextThinkAbout = rubric.data?.feedback?.thinkAbout || '';

      if (
        (field === 'greatJob' && value !== contextGreatJob) ||
        (field === 'thinkAbout' && value !== contextThinkAbout)
      ) {
        const newGreatJob = field === 'greatJob' ? value : contextGreatJob;
        const newThinkAbout = field === 'thinkAbout' ? value : contextThinkAbout;
        updateFeedback(newGreatJob, newThinkAbout).catch(err => {
          console.error('[FeedbackRow] Failed to update feedback:', err);
          toast.error(t('toasts.feedback-update-error'));
        });
      }
    },
    [rubric.data?.feedback?.greatJob, rubric.data?.feedback?.thinkAbout, updateFeedback, t]
  );

  return (
    <>
      <TableRow id="field-feedback">
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
              disabled={disabled}
              variant="standard"
              value={feedback[field]}
              onChange={e => setFeedback(prev => ({ ...prev, [field]: e.target.value }))}
              onBlur={e => handleFeedbackBlur(field, e.target.value)}
              sx={{
                p: 1,
                borderRadius: '12px',
                '& .MuiInput-root': {
                  '&::before': {
                    borderBottom: 'none'
                  },
                  '&::after': {
                    borderBottom: 'none'
                  },
                  '&:hover::before': {
                    borderBottom: 'none !important'
                  },
                  '&.Mui-disabled::before': {
                    borderBottomStyle: 'none !important'
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
