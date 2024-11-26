import { NextPage } from 'next';
import { Formik, Form, FieldProps, Field, FormikHelpers, useFormikContext } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import {
  Paper,
  Button,
  Tooltip,
  Typography,
  Checkbox,
  FormControlLabel,
  Avatar,
  Stack,
  IconButton
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Grid from '@mui/material/Grid2';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import { DivisionSwatches, EventUserAllowedRoles, EventUserAllowedRoleTypes } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import FormikTextField from '../../../components/general/forms/formik-text-field';
import FormikCheckbox from '../../../components/general/forms/formik-checkbox';
import ColorPickerButton from '../../../components/admin/color-picker-button';
import { localizedRoles } from '../../../localization/roles';

interface EventCreateFormValues {
  name: string;
  salesforceId: string;
  enableDivisions: boolean;
  startDate: Dayjs;
  endDate: Dayjs;
  eventUsers: Record<EventUserAllowedRoles, boolean>;
  divisions: {
    name: string;
    color: string;
  }[];
}

const DivisionField: React.FC<{ index: number }> = ({ index }) => {
  const { values, setFieldValue } = useFormikContext<EventCreateFormValues>();
  const name = `divisions[${index}]`;

  return (
    <Grid size={4}>
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" height="100%">
        <Field name={`${name}.color`}>
          {({ field, form }: FieldProps) => (
            <ColorPickerButton
              swatches={DivisionSwatches}
              sx={{ width: 120 }}
              value={field.value}
              setColor={newColor => form.setFieldValue(field.name, newColor)}
            />
          )}
        </Field>
        <FormikTextField
          name={`${name}.name`}
          variant="outlined"
          type="text"
          label="שם בית"
          fullWidth
        />
        <IconButton
          disabled={values.divisions.length < 2}
          onClick={() =>
            setFieldValue('divisions', [...values.divisions.filter((item, i) => i !== index)])
          }
          sx={{ height: 34, width: 34 }}
        >
          <DeleteRoundedIcon />
        </IconButton>
      </Stack>
    </Grid>
  );
};

const Page: NextPage = () => {
  const router = useRouter();

  const resetTimePart = (date: Dayjs): Dayjs =>
    date.set('hours', 0).set('minutes', 0).set('seconds', 0).set('milliseconds', 0);

  const getDefaultDate = () => {
    return dayjs();
  };

  const handleSubmit = (
    values: EventCreateFormValues,
    formikHelpers: FormikHelpers<EventCreateFormValues>
  ) => {
    apiFetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        startDate: resetTimePart(values.startDate || getDefaultDate())
          .tz('utc', true)
          .toDate(),
        endDate: resetTimePart(values.endDate || getDefaultDate())
          .tz('utc', true)
          .toDate(),
        ...(!values.enableDivisions && {
          color: values.divisions[0].color,
          divisions: [{ name: values.name, color: values.divisions[0].color }]
        })
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw 'http-error';
        }
      })
      .then(data => router.push(`/admin/event/${data.id}`))
      .catch(() => enqueueSnackbar('אופס, לא הצלחנו ליצור את האירוע.', { variant: 'error' }));
  };

  const getInitialValues = (): EventCreateFormValues => {
    return {
      name: '',
      salesforceId: '',
      enableDivisions: false,
      eventUsers: { 'tournament-manager': false, 'pit-admin': false },
      startDate: getDefaultDate(),
      endDate: getDefaultDate(),
      divisions: [{ name: '', color: DivisionSwatches[0] }]
    };
  };

  return (
    <Layout maxWidth="lg" title="יצירת אירוע" back="/admin">
      <Formik initialValues={getInitialValues()} onSubmit={handleSubmit}>
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid component={Paper} container rowSpacing={3} columnSpacing={3} p={3} mt={2}>
                <Grid size={12}>
                  <Typography variant="h2" fontSize="1.5rem" fontWeight={500}>
                    כללי
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" spacing={2}>
                    {!values.enableDivisions && (
                      <ColorPickerButton
                        swatches={DivisionSwatches}
                        value={values.divisions[0].color}
                        sx={{ minHeight: 56 }}
                        setColor={newColor => setFieldValue('divisions[0].color', newColor)}
                      />
                    )}
                    <FormikTextField
                      variant="outlined"
                      type="text"
                      name="name"
                      label="שם אירוע"
                      fullWidth
                    />
                    <DatePicker
                      label="תאריך התחלה"
                      value={values.startDate}
                      onChange={newDate => {
                        setFieldValue('startDate', newDate, true);
                        setFieldValue('endDate', newDate, true);
                      }}
                      format="DD/MM/YYYY"
                      sx={{ width: '100%' }}
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          error: touched.startDate && Boolean(errors.startDate)
                        }
                      }}
                    />
                    <DatePicker
                      label="תאריך סיום"
                      value={values.endDate}
                      onChange={newDate => setFieldValue('endDate', newDate, true)}
                      format="DD/MM/YYYY"
                      readOnly
                      sx={{ width: '100%' }}
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          error: touched.endDate && Boolean(errors.endDate)
                        }
                      }}
                    />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Typography variant="h2" fontSize="1.5rem" fontWeight={500}>
                    אינטגרציות
                  </Typography>
                </Grid>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Avatar
                    src="/assets/first-israel-vertical.png"
                    alt="לוגו של פירסט ישראל"
                    sx={{ bgcolor: grey[100], width: 56, height: 56 }}
                  />
                  <Typography minWidth={120}>
                    ה-Dashboard של <em>FIRST</em> ישראל
                  </Typography>
                  <FormControlLabel control={<Checkbox disabled checked />} label="פעיל" />
                  <FormikTextField
                    variant="outlined"
                    type="text"
                    name="salesforceId"
                    label="מזהה אירוע"
                    fullWidth
                  />
                </Stack>
                {values.enableDivisions ? (
                  <>
                    <Grid size={12}>
                      <Typography fontSize="1.5rem" fontWeight={500}>
                        משתמשי אירוע
                      </Typography>
                      <Typography color="textSecondary" fontSize="0.75rem">
                        משתמשי אירוע יקבלו גישה למידע מכל הבתים ויוכלו לעבור ביניהם בלחיצת כפתור.
                      </Typography>
                    </Grid>
                    <Grid size={12}>
                      <Stack direction="row" spacing={4}>
                        {EventUserAllowedRoleTypes.map((user, index) => (
                          <FormikCheckbox
                            name={`eventUsers.[${index}]`}
                            label={localizedRoles[user].name}
                          />
                        ))}
                      </Stack>
                    </Grid>

                    <Grid size={12}>
                      <Typography variant="h2" fontSize="1.5rem" fontWeight={500}>
                        בתים
                      </Typography>
                    </Grid>
                    {values.divisions.map((division, index) => (
                      <DivisionField key={index} index={index} />
                    ))}
                    <Grid size={12}>
                      <Tooltip title="הוספת בית" arrow>
                        <span>
                          <IconButton
                            onClick={() =>
                              setFieldValue('divisions', [
                                ...values.divisions,
                                {
                                  name: '',
                                  color:
                                    DivisionSwatches.filter(
                                      color => !values.divisions.map(d => d.color).includes(color)
                                    )[0] ?? DivisionSwatches[0]
                                }
                              ])
                            }
                          >
                            <AddRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Grid>
                  </>
                ) : (
                  <Grid size={12}>
                    <Button
                      variant="contained"
                      startIcon={<HomeIcon />}
                      size="large"
                      onClick={() => setFieldValue('enableDivisions', true)}
                      sx={{ width: 350 }}
                    >
                      פיצול האירוע לבתים
                    </Button>
                  </Grid>
                )}
              </Grid>
              <Stack direction="row" marginTop={2} justifyContent="center">
                <Button type="submit" variant="contained" sx={{ minWidth: 180 }}>
                  צור אירוע
                </Button>
              </Stack>
            </LocalizationProvider>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default Page;
