import { NextPage } from 'next';
import { Formik, Form, FieldProps, Field } from 'formik';
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
import Grid from '@mui/material/Unstable_Grid2';
import ImportIcon from '@mui/icons-material/UploadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { DivisionSwatches } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import FormikTextField from '../../../components/general/forms/formik-text-field';
import ColorPickerButton from '../../../components/admin/color-picker-button';

const DivisionField: React.FC<{ name: string }> = ({ name }) => {
  return (
    <Grid container alignItems="center" xs={6} spacing={2}>
      <Grid xs={1.5} position="relative" height="100%">
        <Field name={`${name}.color`}>
          {({ field, form }: FieldProps) => (
            <ColorPickerButton
              swatches={DivisionSwatches}
              fullWidth
              value={field.value}
              setColor={newColor => form.setFieldValue(field.name, newColor)}
            />
          )}
        </Field>
      </Grid>
      <Grid xs={10.5}>
        <FormikTextField
          name={`${name}.name`}
          variant="outlined"
          type="text"
          label="שם בית"
          fullWidth
        />
      </Grid>
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

  const handleSubmit = (values: any, formikHelpers: any) => {
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
          .toDate()
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

  const getInitialValues = () => {
    return {
      name: '',
      salesforceId: '',
      startDate: getDefaultDate(),
      endDate: getDefaultDate(),
      divisions: [{ name: '', color: DivisionSwatches[0] }]
    };
  };

  return (
    <Layout maxWidth="xl" title="יצירת אירוע">
      <Formik initialValues={getInitialValues()} onSubmit={handleSubmit}>
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid component={Paper} container rowGap={3} columnSpacing={3} p={2} mt={2}>
                <Grid xs={12}>
                  <Typography variant="h2">הגדרות כלליות</Typography>
                </Grid>
                <Grid xs={4}>
                  <FormikTextField
                    variant="outlined"
                    type="text"
                    name="name"
                    label="שם אירוע"
                    fullWidth
                  />
                </Grid>
                <Grid xs={4}>
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
                        // helperText: touched.startDate && errors.startDate
                      }
                    }}
                  />
                </Grid>
                <Grid xs={4}>
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
                        // helperText: touched.endDate && errors.endDate
                      }
                    }}
                  />
                </Grid>
                <Grid xs={4}>
                  <Button
                    variant="contained"
                    startIcon={<ImportIcon />}
                    disabled
                    size="large"
                    fullWidth
                  >
                    העלאת רשימת קבוצות
                  </Button>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="h2">הגדרות אינטגרציה</Typography>
                </Grid>
                <Grid container alignItems="center" xs={4} spacing={2}>
                  <Grid xs={2}>
                    <Avatar
                      src="/assets/first-israel-vertical.png"
                      alt="לוגו של פירסט ישראל"
                      sx={{ bgcolor: grey[100], width: 56, height: 56 }}
                    />
                  </Grid>
                  <Grid xs={4}>
                    <Typography>
                      ה-Dashboard של <em>FIRST</em> ישראל
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <FormControlLabel control={<Checkbox disabled checked />} label="פעיל" />
                  </Grid>
                  <Grid xs={4}>
                    <FormikTextField
                      variant="outlined"
                      type="text"
                      name="salesforceId"
                      label="מזהה אירוע"
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="h2">הגדרות בתים</Typography>
                </Grid>
                <DivisionField name="divisions[0]" />
              </Grid>
              <Grid xs={12}>
                <Tooltip title="הוספת בית" arrow>
                  <span>
                    <IconButton disabled>
                      <AddRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
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

// export const getServerSideProps: GetServerSideProps = async () => {
// };

export default Page;
