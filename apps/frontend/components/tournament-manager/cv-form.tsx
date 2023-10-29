import { FastField, FieldProps, Form, Formik, FormikValues } from 'formik';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import {
  CVFormCategoryNamesTypes,
  CVFormSubject,
  Team,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import { cvFormSchema } from '@lems/season';
import {
  FormControlLabel,
  Typography,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Checkbox,
  Stack,
  Paper,
  Divider,
  Button,
  Box
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CVFormSubjectSelect from '../general/cv-form-subject';
import Image from 'next/image';

interface CVFormProps {
  teams: Array<WithId<Team>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const CVForm: React.FC<CVFormProps> = ({ teams, socket }) => {
  const getEmptyCVForm = () => {
    const observers: Array<CVFormSubject> = [];
    const demonstrators: Array<CVFormSubject> = [];
    const data = CVFormCategoryNamesTypes.map(name => {
      const category = cvFormSchema.categories.find(category => category.id === name);
      return {
        teamOrStudent: category?.teamOrStudent.map(() => false) || [],
        anyoneElse: category?.anyoneElse.map(() => false) || []
      };
    });
    const details = '';
    const completedBy = {
      name: '',
      phone: '',
      affiliation: ''
    };
    const actionTaken = '';
    return { observers, demonstrators, data, details, completedBy, actionTaken };
  };

  const validateForm = (formValues: FormikValues) => {
    console.log('valid');
    const errors: any = {};

    if (formValues.observers.length === 0) {
      errors.observers = 'שדה חובה';
    } else if (
      formValues.observers.find(
        (subject: CVFormSubject) => subject === 'team' && !formValues.observerAffiliation
      )
    ) {
      errors.observerAffiliation = 'נא לציין מספר קבוצה';
    }

    if (formValues.demonstrators.length === 0) {
      errors.demonstrators = 'שדה חובה';
    } else if (
      formValues.demonstrators.find(
        (subject: CVFormSubject) => subject === 'team' && !formValues.demonstratorAffiliation
      )
    ) {
      errors.demonstratorAffiliation = 'נא לציין מספר קבוצה';
    }

    if (
      !formValues.data
        .flatMap((category: { teamOrStudent: boolean[]; anyoneElse: boolean[] }) =>
          category.teamOrStudent.concat(category.anyoneElse)
        )
        .some((x: boolean) => x)
    ) {
      errors.data = 'נא לסמן לפחות שדה אחד';
    }

    if (!formValues.details) {
      errors.details = 'יש למלא את תיאור המקרה';
    }
    if (
      !formValues.completedBy.name ||
      !formValues.completedBy.phone ||
      !formValues.completedBy.affiliation
    ) {
      errors.completedBy = 'נא למלא את פרטי ממלא הטופס';
    }
    console.log(errors);
    return errors;
  };

  return (
    <Formik
      initialValues={getEmptyCVForm()}
      validate={validateForm}
      onSubmit={(values, actions) => {
        console.log(values);
        actions.setSubmitting(false);
      }}
      validateOnChange
      validateOnMount
    >
      {({ values, isValid, submitForm }) => (
        <Form>
          <Typography variant="h2" sx={{ mb: 2 }}>
            טופס ערכי ליבה
          </Typography>
          <Grid container columnGap={6} sx={{ mb: 4 }}>
            <Grid xs={12} md={5}>
              <Typography color="text.secondary" fontSize="0.875rem">
                טופס ערכי הליבה נועד על מנת לתעד עדויות של התרחשויות, בין אם הן טובות או לא, של
                קבוצות, תלמידים מנטורים ומתנדבים ולשתפן עם השופט הראשי ומנהל האירוע.
              </Typography>
            </Grid>

            <Grid container xs={12} md={6} rowGap={2} columnSpacing={2}>
              <Grid xs={12}>
                <Typography fontSize="0.875rem">סמנו מי היו עדים להתרחשות</Typography>
              </Grid>
              <Grid xs={values.observers.includes('team') ? 6 : 12}>
                <CVFormSubjectSelect name="observers" readOnly={false} />
              </Grid>
              {values.observers.includes('team') && (
                <Grid xs={6} sx={{ display: 'flex' }}>
                  <FastField name="observerAffiliation">
                    {({ field, form }: FieldProps) => (
                      <TextField
                        fullWidth
                        label="מספר קבוצה"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '100%'
                          }
                        }}
                        {...field}
                        value={field.value}
                        onChange={e => form.setFieldValue(field.name, e.target.value)}
                      />
                    )}
                  </FastField>
                </Grid>
              )}
              <Grid xs={12}>
                <Typography fontSize="0.875rem">סמנו מי גרמו להתרחשות</Typography>
              </Grid>
              <Grid xs={values.observers.includes('team') ? 6 : 12}>
                <CVFormSubjectSelect name="demonstrators" readOnly={false} />
              </Grid>
              {values.observers.includes('team') && (
                <Grid xs={6} sx={{ display: 'flex' }}>
                  <FastField name="demonstratorAffiliation">
                    {({ field, form }: FieldProps) => (
                      <TextField
                        fullWidth
                        label="מספר קבוצה"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '100%'
                          }
                        }}
                        value={field.value}
                        onChange={e => form.setFieldValue(field.name, e.target.value)}
                      />
                    )}
                  </FastField>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Table component={Paper} stickyHeader>
            <TableContainer sx={{ height: 600, overflowY: 'scroll' }}>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {cvFormSchema.columns.map(column => (
                    <TableCell key={column.title} align="center">
                      {column.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {cvFormSchema.categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell align="center">
                      <Image
                        width={64}
                        height={64}
                        src={`https://emojicdn.elk.sh/${category.emoji}`}
                        alt="אימוג׳י המתאר את חומרת הקטגוריה"
                      />
                      <Typography fontSize="1rem" fontWeight={500}>
                        {category.title}
                      </Typography>
                      <Typography fontSize="1rem" fontWeight={500}>
                        {category.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={2}>
                        {category.teamOrStudent.map((clause, index) => (
                          <FastField
                            key={index}
                            name={`data.${category.id}.teamOrStudent.${index}`}
                          >
                            {({ field, form }: FieldProps) => (
                              <FormControlLabel
                                label={clause}
                                control={
                                  <Checkbox
                                    checked={field.value}
                                    onChange={(_e, checked) =>
                                      form.setFieldValue(field.name, checked)
                                    }
                                  />
                                }
                              />
                            )}
                          </FastField>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {category.anyoneElse.map((clause, index) => (
                        <FastField key={index} name={`data.${category.id}.anyoneElse.${index}`}>
                          {({ field, form }: FieldProps) => (
                            <FormControlLabel
                              label={clause}
                              control={
                                <Checkbox
                                  checked={field.value}
                                  onChange={(_e, checked) =>
                                    form.setFieldValue(field.name, checked)
                                  }
                                />
                              }
                            />
                          )}
                        </FastField>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
          </Table>

          <Paper sx={{ p: 4, mt: 2 }}>
            <Stack spacing={2}>
              <FastField name="details">
                {({ field, form }: FieldProps) => (
                  <TextField
                    minRows={3}
                    multiline
                    fullWidth
                    label="תיאור ההתרחשות"
                    {...field}
                    value={field.value}
                    onChange={e => form.setFieldValue(field.name, e.target.value)}
                  />
                )}
              </FastField>
              <Divider />
              <Typography fontSize="1.25rem" fontWeight={700}>
                פרטי ממלא הטופס
              </Typography>
              <Stack direction="row" spacing={2}>
                <FastField name="completedBy.name">
                  {({ field, form }: FieldProps) => (
                    <TextField
                      label="שם"
                      value={field.value}
                      fullWidth
                      onChange={e => form.setFieldValue(field.name, e.target.value)}
                    />
                  )}
                </FastField>
                <FastField name="completedBy.phone">
                  {({ field, form }: FieldProps) => (
                    <TextField
                      label="טלפון"
                      value={field.value}
                      fullWidth
                      type="phone"
                      onChange={e => form.setFieldValue(field.name, e.target.value)}
                    />
                  )}
                </FastField>
                <FastField name="completedBy.affiliation">
                  {({ field, form }: FieldProps) => (
                    <TextField
                      label="תפקיד"
                      value={field.value}
                      fullWidth
                      onChange={e => form.setFieldValue(field.name, e.target.value)}
                    />
                  )}
                </FastField>
              </Stack>
            </Stack>
          </Paper>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              sx={{ minWidth: 300, mt: 4 }}
              onClick={submitForm}
              disabled={!isValid}
            >
              הגשה
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default CVForm;
