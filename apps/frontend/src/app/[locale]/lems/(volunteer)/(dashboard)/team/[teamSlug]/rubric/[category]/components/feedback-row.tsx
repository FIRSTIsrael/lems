'use client';

import { useRubricsGeneralTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types';
import { useFormikContext } from 'formik';
import { TableRow, TableCell, Typography, TextField } from '@mui/material';
import type { RubricFormValues } from '../rubric-utils';

interface FeedbackRowProps {
  category: JudgingCategory;
  disabled?: boolean;
  rounded?: boolean;
}

const colors: { [key: string]: string } = {
  'core-values': '#F5DAD4',
  'innovation-project': '#D3DAED',
  'robot-design': '#DAE8D8'
};

export const FeedbackRow: React.FC<FeedbackRowProps> = ({
  category,
  disabled = false,
  rounded = false
}) => {
  const feedbackFields = ['great-job', 'think-about'] as const;
  const { getFeedbackTitle } = useRubricsGeneralTranslations();
  const { values, setFieldValue } = useFormikContext<RubricFormValues>();

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
              borderRadius: rounded ? (index === 0 ? '12px 0 0 0' : '0 12px 0 0') : undefined,
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
              defaultValue={values.feedback?.[field] ?? ''}
              onChange={() => {
                // Update local state only during typing
              }}
              onBlur={e => setFieldValue(`feedback.${field}`, e.target.value)}
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
