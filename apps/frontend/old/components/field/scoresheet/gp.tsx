import { Field, FieldProps } from 'formik';
import React, { useState } from 'react';
import {
  Paper,
  Radio,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { SafeUser, ScoresheetStatus } from '@lems/types';
import ExceededNotesCell from '../../judging/rubrics/exceeded-notes-cell';
import { RoleAuthorizer } from '../../role-authorizer';

interface GpSelectorProps {
  user: SafeUser;
  scoresheetStatus: ScoresheetStatus;
  onBack: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const columns = [
  { name: '2', title: 'מתפתחת', color: '#F3D0C9', value: 2 },
  { name: '3', title: 'מיומנת', color: '#EBB3AA', value: 3 },
  { name: '4', title: 'מצטיינת', color: '#E4928B', value: 4 }
];

const GpSelector: React.FC<GpSelectorProps> = ({
  user,
  scoresheetStatus,
  onBack,
  onSubmit,
  disabled
}) => {
  const [checked, setChecked] = useState<boolean>(
    scoresheetStatus === 'ready' || user.role === 'head-referee'
  );
  const name = 'gp';
  return (
    <Paper sx={{ p: 4, mt: 2 }}>
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
                <TableRow>
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
                        checked={field.value === column.value}
                        onChange={() => form.setFieldValue(field.name, column.value)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
                {(field.value === 4 || field.value === 2) && (
                  <ExceededNotesCell
                    placeholder={`נמקו מדוע נתתם לקבוצה ציון ${
                      field.value === 2 ? 'מתפתחת' : 'מצטיינת'
                    }`}
                    name={name}
                    disabled={disabled}
                  />
                )}
              </TableBody>
            </Table>

            <RoleAuthorizer user={user} allowedRoles={['referee']}>
              {field.value && field.value !== 3 && (
                <Box justifyContent="center" display="flex" pt={2}>
                  <FormControlLabel
                    control={<Checkbox />}
                    value={checked}
                    onChange={() => setChecked(value => !value)}
                    label={`השופט הראשי ראה ואישר שנתתי לקבוצה ציון ${
                      field.value === 2 ? 'מתפתחת' : 'מצטיינת'
                    }`}
                  />
                </Box>
              )}
            </RoleAuthorizer>

            <Stack direction="row" mt={4} mb={2} justifyContent="center" spacing={3}>
              <RoleAuthorizer user={user} allowedRoles={['head-referee']}>
                <Button
                  variant="contained"
                  sx={{ minWidth: 125 }}
                  startIcon={<ChevronRightIcon />}
                  onClick={onBack}
                  disabled={form.isSubmitting}
                >
                  חזור
                </Button>
              </RoleAuthorizer>
              <Button
                variant="contained"
                sx={{ minWidth: 125 }}
                endIcon={<ChevronLeftIcon />}
                onClick={onSubmit}
                disabled={
                  !form.values.gp ||
                  (form.values.gp.value !== 3 && (!form.values.gp.notes || !checked))
                }
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
