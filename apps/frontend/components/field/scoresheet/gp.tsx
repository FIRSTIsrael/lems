import { Field, FieldProps } from 'formik';
import React from 'react';
import {
  Paper,
  Radio,
  Button,
  Stack,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface Props {
  onSubmit: () => void;
  onBack: () => void;
  disabled?: boolean;
}

const columns = [
  { name: '2', title: 'מתפתחת', color: '#F3D0C9', value: 2 },
  { name: '3', title: 'מיומנת', color: '#EBB3AA', value: 3 },
  { name: '4', title: 'מצטיינת', color: '#E4928B', value: 4 }
];

const GpSelector: React.FC<Props> = ({ onSubmit, onBack, disabled }) => {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h2" fontSize="1.5rem" fontWeight={500} pb={4} textAlign="center">
        דרגו את המקצועיות האדיבה שהציגה הקבוצה במהלך משחק הרובוט
      </Typography>

      <Field name="gp">
        {({ field: { onBlur, onChange, ...field }, form, meta }: FieldProps) => (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      align="center"
                      sx={{
                        bgcolor: columns[index].color,
                        border: '1px solid #000',
                        fontSize: '1em',
                        py: '0.875em',
                        px: '0.5em',
                        top: theme => theme.mixins.toolbar.minHeight,
                        '@media print': {
                          position: 'inherit',
                          top: 'unset'
                        }
                      }}
                    >
                      <Typography fontSize="1em" fontWeight={700}>
                        {column.title}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <RadioGroup
                  sx={{ display: 'table-row' }}
                  onChange={e => {
                    onChange(e ?? field.name);
                    setTimeout(() => onBlur(e ?? field.name), 10);
                  }}
                  {...field}
                >
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      align="center"
                      sx={{
                        border: '1px solid rgba(0,0,0,0.2)',
                        fontSize: '1em',
                        p: '0.75em',
                        pr: '0.5em',
                        pl: '0.25em',
                        backgroundColor: '#fff'
                      }}
                    >
                      <Radio
                        value={column.value}
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
                      />
                    </TableCell>
                  ))}
                </RadioGroup>
              </TableBody>
            </Table>

            <Stack direction="row" mt={4} mb={2} justifyContent="center" spacing={3}>
              <Button
                variant="contained"
                sx={{ minWidth: 125 }}
                startIcon={<ChevronRightIcon />}
                onClick={onBack}
              >
                חזור
              </Button>
              <Button
                variant="contained"
                sx={{ minWidth: 125 }}
                endIcon={<ChevronLeftIcon />}
                onClick={onSubmit}
                disabled={!field.value}
              >
                שלח
              </Button>
            </Stack>
          </>
        )}
      </Field>
    </Paper>
  );
};

export default GpSelector;
