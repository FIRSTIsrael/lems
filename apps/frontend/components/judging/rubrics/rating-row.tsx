import React from 'react';
import { TableCell, FormControlLabel, Radio, TableRow, Typography } from '@mui/material';
import { Field, FieldProps } from 'formik';
import ReactMarkdown from 'react-markdown';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import ExceededNotesCell from './exceeded-notes-cell';

// The labels are split into 4 props to help React.memo() optimize the rendering.
interface Props {
  name: string;
  label_1?: string;
  label_2?: string;
  label_3?: string;
  label_4?: string;
  disabled?: boolean;
}

const RatingRow = ({ name, label_1, label_2, label_3, label_4, disabled }: Props) => {
  const labels = [label_1, label_2, label_3, label_4];
  return (
    <Field name={`${name}.value`}>
      {({ field: { onBlur, onChange, ...field }, form, meta }: FieldProps) => (
        <>
          <TableRow>
            {labels.map((label, index) => (
              <TableCell
                key={label ? label + index : index}
                align={label ? 'left' : 'center'}
                sx={{
                  borderTop: '1px solid #000',
                  borderRight: '1px solid rgba(0,0,0,0.2)',
                  borderLeft: '1px solid rgba(0,0,0,0.2)',
                  borderBottom: 'none',
                  fontSize: '1em',
                  p: '0.75em',
                  pr: '0.5em',
                  pl: '0.25em',
                  backgroundColor: '#fff'
                }}
              >
                <FormControlLabel
                  value={index + 1}
                  control={
                    <Radio
                      disableRipple
                      sx={{ p: '0.5em' }}
                      icon={
                        <UncheckedIcon
                          sx={{
                            fontSize: '1.5em',
                            color: meta.touched && meta.error ? '#f74848' : 'rgba(0,0,0,0.24)'
                          }}
                        />
                      }
                      checkedIcon={<CheckedIcon sx={{ fontSize: '1.5em', color: '#0071e3' }} />}
                      checked={field.value === index + 1}
                      onChange={e => {
                        form.setFieldValue(field.name, index + 1);
                        setTimeout(() => onBlur(e ?? field.name), 10); // Rubric doesn't update without this
                      }}
                    />
                  }
                  disabled={disabled || form.isSubmitting}
                  label={
                    <Typography
                      fontSize="0.875em"
                      fontWeight={field.value === String(index + 1) ? 700 : undefined}
                    >
                      <ReactMarkdown skipHtml components={{ p: React.Fragment }}>
                        {label || ''}
                      </ReactMarkdown>
                    </Typography>
                  }
                  sx={{ mx: 0 }}
                />
              </TableCell>
            ))}
          </TableRow>
          {field.value === 4 && <ExceededNotesCell name={name} disabled={disabled} />}
        </>
      )}
    </Field>
  );
};

export default RatingRow;
