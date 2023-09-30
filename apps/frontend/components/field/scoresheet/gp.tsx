import { Field, FieldProps } from 'formik';
import React, { useState } from 'react';
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
  Typography,
  FormControlLabel,
  Checkbox,
  FormControl,
  Box
} from '@mui/material';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExceededNotesCell from '../../judging/rubrics/exceeded-notes-cell';
import { SafeUser } from '@lems/types';
import { RoleAuthorizer } from '../../role-authorizer';

interface Props {
  user: SafeUser;
  onBack: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const columns = [
  { name: '2', title: 'מתפתחת', color: '#F3D0C9', value: 2 },
  { name: '3', title: 'מיומנת', color: '#EBB3AA', value: 3 },
  { name: '4', title: 'מצטיינת', color: '#E4928B', value: 4 }
];

const GpSelector: React.FC<Props> = ({ user, onBack, onSubmit, disabled }) => {
  const [checked, setChecked] = useState<boolean>(false);
  const name = 'gp';
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h2" fontSize="1.5rem" fontWeight={500} pb={4} textAlign="center">
        דרגו את המקצועיות האדיבה שהציגה הקבוצה במהלך משחק הרובוט
      </Typography>

      <Field name={`${name}.value`}>
        {({ field: { onBlur, onChange, ...field }, form, meta }: FieldProps) => (
          <>
            <Table sx={{ border: '1px solid rgba(0,0,0,0.2)' }}>
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
                {(field.value === '4' || field.value === '2') && (
                  <ExceededNotesCell
                    placeholder={`נמקו מדוע נתתם לקבוצה ציון ${
                      field.value === '2' ? 'מתפתחת' : 'מצטיינת'
                    }`}
                    name={name}
                    disabled={disabled}
                  />
                )}
              </TableBody>
            </Table>

            {field.value && field.value !== '3' && (
              <Box justifyContent="center" display="flex" pt={2}>
                <FormControlLabel
                  control={<Checkbox />}
                  value={checked}
                  onChange={() => setChecked(value => !value)}
                  label={`השופט הראשי ראה ואישר שנתתי לקבוצה ציון ${
                    field.value === '2' ? 'מתפתחת' : 'מצטיינת'
                  }`}
                />
              </Box>
            )}

            <Stack direction="row" mt={4} mb={2} justifyContent="center" spacing={3}>
              <Button
                variant="contained"
                sx={{ minWidth: 125 }}
                endIcon={<ChevronLeftIcon />}
                onClick={onSubmit}
                disabled={
                  !form.values.gp ||
                  (form.values.gp.value !== '3' && (!form.values.gp.notes || !checked))
                }
              >
                שלח
              </Button>
              <RoleAuthorizer user={user} allowedRoles={['head-referee']}>
                <Button
                  variant="contained"
                  sx={{ minWidth: 125 }}
                  endIcon={<ChevronRightIcon />}
                  onClick={onBack}
                  disabled={form.isSubmitting}
                >
                  חזור
                </Button>
              </RoleAuthorizer>
            </Stack>
          </>
        )}
      </Field>
    </Paper>
  );
};

export default GpSelector;
