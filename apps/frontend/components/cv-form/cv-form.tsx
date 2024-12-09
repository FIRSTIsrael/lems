import { Form, Formik, FormikValues } from 'formik';
import { Socket } from 'socket.io-client';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Table,
  TableContainer,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Typography,
  Stack,
  Paper,
  Divider,
  Button,
  Box
} from '@mui/material';
import {
  CVFormCategory,
  CVFormCategoryNames,
  CVFormCategoryNamesTypes,
  CVFormSubject,
  CoreValuesForm,
  Division,
  WSClientEmittedEvents,
  WSServerEmittedEvents,
  SafeUser,
  Team
} from '@lems/types';
import { fullMatch } from '@lems/utils/objects';
import { cvFormSchema } from '@lems/season';
import FormikTextField from '../general/forms/formik-text-field';
import CVFormHeader from './cv-form-header';
import CVFormCategoryRow from './cv-form-category-row';

interface CVFormProps {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  cvForm?: WithId<CoreValuesForm>;
  readOnly?: boolean;
  onSubmit?: () => void;
}

const CVForm: React.FC<CVFormProps> = ({
  user,
  division,
  teams,
  socket,
  cvForm: initialCvForm,
  readOnly = false,
  onSubmit
}) => {
  const getCvForm = (cvForm: WithId<CoreValuesForm>) => {
    const { _id, severity, ...rest } = cvForm;
    return { ...rest };
  };

  const getEmptyCVForm = () => {
    const divisionId = division._id;
    const observers: Array<CVFormSubject> = [];
    const observerAffiliation: WithId<Team> | null = null;
    const demonstrators: Array<CVFormSubject> = [];
    const demonstratorAffiliation: WithId<Team> | null = null;
    const data: { [key in CVFormCategoryNames]: CVFormCategory } = {} as {
      [key in CVFormCategoryNames]: CVFormCategory;
    };
    CVFormCategoryNamesTypes.forEach(name => {
      const category = cvFormSchema.categories.find(category => category.id === name);
      data[name] = {
        teamOrStudent: {
          fields: category?.teamOrStudent.map(() => false) || [],
          other: ''
        },
        anyoneElse: {
          fields: category?.anyoneElse.map(() => false) || [],
          other: ''
        }
      } as CVFormCategory;
    });
    const completedBy = {
      name: '',
      phone: '',
      affiliation: ''
    };
    return {
      divisionId,
      observers,
      observerAffiliation,
      demonstrators,
      demonstratorAffiliation,
      data,
      details: '',
      completedBy,
      actionTaken: '',
      actionTakenBy: ''
    };
  };

  const validateForm = (formValues: FormikValues) => {
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
      !Object.values(formValues.data)
        .flatMap(c => {
          const category = c as {
            teamOrStudent: { fields: Array<boolean>; other?: string };
            anyoneElse: { fields: Array<boolean>; other?: string };
          };
          return category.teamOrStudent.fields
            .concat(category.anyoneElse.fields)
            .concat([!!category.teamOrStudent.other])
            .concat([!!category.anyoneElse.other]);
        })
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
    return errors;
  };

  const getFormSeverity = (formValues: FormikValues) => {
    let severity: CVFormCategoryNames = 'standardExpectations';
    const { data } = formValues;

    const anyCategoryField = (category: CVFormCategory): boolean => {
      const allFields = category.teamOrStudent.fields.concat(category.anyoneElse.fields);
      return !!(
        allFields.some((x: boolean) => x) ||
        category.teamOrStudent.other ||
        category.anyoneElse.other
      );
    };

    [
      'aboveExpectations',
      'exceedsExpectations',
      'possibleConcern',
      'belowExpectations',
      'inappropriate'
    ].forEach(category => {
      if (anyCategoryField(data[category])) severity = category as CVFormCategoryNames;
    });

    return severity;
  };

  return (
    <Formik
      initialValues={initialCvForm ? getCvForm(initialCvForm) : getEmptyCVForm()}
      validate={validateForm}
      onSubmit={(values, actions) => {
        const severity = getFormSeverity(values);

        if (initialCvForm) {
          socket.emit(
            'updateCvForm',
            division._id.toString(),
            initialCvForm._id.toString(),
            { ...values, severity },
            response => {
              if (response.ok) {
                enqueueSnackbar('הטופס עודכן בהצלחה!', { variant: 'success' });
                actions.resetForm();
              } else {
                enqueueSnackbar('אופס, לא הצלחנו לעדכן את טופס ערכי הליבה.', {
                  variant: 'error'
                });
              }
            }
          );
        } else {
          socket.emit(
            'createCvForm',
            division._id.toString(),
            { ...values, severity },
            response => {
              if (response.ok) {
                enqueueSnackbar('הטופס הוגש בהצלחה!', { variant: 'success' });
                actions.resetForm();
              } else {
                enqueueSnackbar('אופס, לא הצלחנו להגיש את טופס ערכי הליבה.', { variant: 'error' });
              }
            }
          );
        }

        if (onSubmit) onSubmit();
        actions.setSubmitting(false);
      }}
      validateOnChange
      validateOnMount
    >
      {({ values, isValid, submitForm }) => (
        <Form>
          <CVFormHeader teams={teams} values={values} readOnly={readOnly} />
          <TableContainer component={Paper} sx={{ mt: 4, height: 600, overflowY: 'scroll' }}>
            <Table stickyHeader>
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
                {cvFormSchema.categories.map((category, index) => (
                  <CVFormCategoryRow key={category.id} category={category} readOnly={readOnly} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Paper sx={{ p: 4, mt: 2 }}>
            <Stack spacing={2}>
              <FormikTextField
                minRows={3}
                multiline
                InputProps={{ readOnly }}
                name="details"
                label="תיאור ההתרחשות"
              />
              <Divider />
              <Typography fontSize="1.25rem" fontWeight={700}>
                פרטי ממלא הטופס
              </Typography>
              <Stack direction="row" spacing={2}>
                <FormikTextField name="completedBy.name" label="שם" InputProps={{ readOnly }} />
                <FormikTextField name="completedBy.phone" label="טלפון" InputProps={{ readOnly }} />
                <FormikTextField
                  name="completedBy.affiliation"
                  label="תפקיד"
                  InputProps={{ readOnly }}
                />
              </Stack>
              <Divider />
              <FormikTextField
                minRows={3}
                multiline
                name="actionTaken"
                label="פעולות שננקטו"
                InputProps={{ readOnly: !(user.role === 'judge-advisor') }}
                {...(initialCvForm?.actionTaken || user.role === 'tournament-manager'
                  ? {}
                  : { color: 'warning', autoFocus: true })}
              />
              <FormikTextField
                name="actionTakenBy"
                label="טופל על ידי"
                InputProps={{ readOnly: !(user.role === 'judge-advisor') }}
                {...(initialCvForm?.actionTakenBy || user.role === 'tournament-manager'
                  ? {}
                  : { color: 'warning' })}
              />
            </Stack>
          </Paper>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              sx={{ minWidth: 300, mt: 4 }}
              onClick={submitForm}
              disabled={!isValid || (initialCvForm && fullMatch(values, getCvForm(initialCvForm)))}
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
