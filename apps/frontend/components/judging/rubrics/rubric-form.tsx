import React from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { Form, Formik, FormikValues } from 'formik';
import ReactMarkdown from 'react-markdown';
import {
  Typography,
  Button,
  Table,
  Alert,
  Stack,
  TableHead,
  TableBody,
  SxProps,
  Theme
} from '@mui/material';
import { purple } from '@mui/material/colors';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Event,
  Team,
  Rubric,
  JudgingCategory,
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  SafeUser,
  RubricValue
} from '@lems/types';
import { fullMatch } from '@lems/utils/objects';
import { RubricsSchema } from '@lems/season';
import FormikTextField from '../../general/forms/formik-text-field';
import AwardCandidatureCheckbox from './award-candidature-checkbox';
import RatingRow from './rating-row';
import HeaderRow from './header-row';
import TitleRow from './title-row';
import { enqueueSnackbar } from 'notistack';
import { RoleAuthorizer } from '../../role-authorizer';

interface RubricFormProps {
  event: WithId<Event>;
  team: WithId<Team>;
  rubric: WithId<Rubric<JudgingCategory>>;
  schema: RubricsSchema<JudgingCategory>;
  user: WithId<SafeUser>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  hideTitle?: boolean;
  hideDescription?: boolean;
}

const RubricForm: React.FC<RubricFormProps> = ({
  event,
  team,
  rubric,
  schema,
  user,
  socket,
  hideTitle = false,
  hideDescription = false
}) => {
  const router = useRouter();
  const fields = schema.sections.flatMap(section => section.fields.map(field => field.id));
  const awardCandidates = schema.awards?.map(award => award.id) || [];

  const isEditable =
    (user.role === 'judge' && ['empty', 'in-progress', 'completed'].includes(rubric.status)) ||
    (user.role === 'lead-judge' &&
      ['empty', 'in-progress', 'completed', 'waiting-for-review'].includes(rubric.status)) ||
    user.role === 'judge-advisor';

  const getEmptyRubric = () => {
    const awardKeys = [...awardCandidates] as const;
    const fieldKeys = [...fields] as const;

    const awards: { [key in (typeof awardKeys)[number]]: boolean } = {} as {
      [key in (typeof awardKeys)[number]]: boolean;
    };
    awardCandidates.map(award => (awards[award] = false));

    const values: { [key in (typeof fieldKeys)[number]]: RubricValue } = {} as {
      [key in (typeof fieldKeys)[number]]: RubricValue;
    };
    fields.map(field => (values[field] = { value: 0 }));

    const feedback = { greatJob: '', thinkAbout: '' };

    return { awards, values, feedback };
  };

  const handleSync = async (
    showSnackbar: boolean,
    formValues: FormikValues | undefined,
    newstatus: string | undefined
  ) => {
    const updatedRubric = {} as any;
    if (newstatus) updatedRubric['status'] = newstatus;
    if (formValues) updatedRubric['data'] = formValues;

    socket.emit(
      'updateRubric',
      event._id.toString(),
      team._id.toString(),
      rubric._id.toString(),
      updatedRubric as Partial<Rubric<typeof rubric.category>>,
      response => {
        if (response.ok) {
          if (showSnackbar) {
            enqueueSnackbar('המחוון נשמר בהצלחה.', { variant: 'success' });
          }
        } else {
          enqueueSnackbar('אופס, שמירת המחוון נכשלה.', { variant: 'error' });
        }
      }
    );
  };

  const validateRubric = (formValues: FormikValues) => {
    const errors: any = {};

    fields.forEach(field => {
      if (!formValues.values[field].value) {
        errors[field] = 'שדה חובה';
      } else if (formValues.values[field].value === 4 && !formValues.values[field].notes) {
        errors[field] = 'נדרש הסבר לציון';
      }
    });

    schema.feedback?.forEach(feedback => {
      if (!formValues.feedback[feedback.id]) {
        errors[feedback.id] = 'שדה חובה';
      }
    });

    if (isEditable) {
      const isCompleted = Object.keys(errors).length === 0;
      const isEmpty = fullMatch(formValues, getEmptyRubric());

      let newStatus = undefined;
      if (isEmpty) {
        newStatus = 'empty';
      } else if (!isCompleted) {
        newStatus = 'in-progress';
      } else if (isCompleted && ['empty', 'in-progress', 'completed'].includes(rubric.status)) {
        newStatus = 'completed';
      } else if (isCompleted && ['waiting-for-review', 'ready'].includes(rubric.status)) {
        newStatus = rubric.status;
      }

      if (!fullMatch(rubric.data, formValues) || rubric.status !== newStatus) {
        handleSync(false, formValues, newStatus);
      }
    }

    return errors;
  };

  const actionButtonStyle: SxProps<Theme> = {
    minWidth: 120,
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: purple[500],
    '&:hover': {
      backgroundColor: purple[700]
    }
  };

  return (
    <>
      <Formik
        initialValues={rubric.data || getEmptyRubric()}
        validate={validateRubric}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false);
        }}
        enableReinitialize
        validateOnMount
      >
        {({ values, isValid, resetForm }) => (
          <Form>
            {!hideTitle && (
              <Typography variant="h2" sx={{ mb: 2 }}>
                {schema.title}
              </Typography>
            )}
            {(!hideDescription || (schema.awards?.length || 0) > 0) && (
              <Grid container spacing={6} sx={{ mb: 4 }}>
                {!hideDescription && (
                  <Grid xs={12} md={(schema.awards?.length || 0) > 0 ? 5 : 9}>
                    <Typography color="text.secondary" fontSize="0.875rem">
                      <ReactMarkdown skipHtml components={{ p: React.Fragment }}>
                        {schema.description}
                      </ReactMarkdown>
                    </Typography>
                  </Grid>
                )}

                {schema.awards && schema.awards.length > 0 && (
                  <Grid xs={12} md={7}>
                    <Typography variant="body2" gutterBottom>
                      אם הקבוצה הצטיינה באחד התחומים הבאים, נא לסמן את המשבצת המתאימה:
                    </Typography>
                    {schema.awards.map(award => (
                      <AwardCandidatureCheckbox
                        key={award.id}
                        name={`awards.${award.id}`}
                        title={award.title}
                        description={award.description}
                        disabled={!isEditable}
                      />
                    ))}
                  </Grid>
                )}
              </Grid>
            )}

            <Stack
              spacing={2}
              sx={{
                maxWidth: '20rem',
                mx: 'auto',
                my: 4
              }}
            >
              {!isEditable && (
                <Alert
                  severity="warning"
                  sx={{
                    fontWeight: 500,
                    border: '1px solid #ff9800'
                  }}
                >
                  המחוון נעול, אין באפשרותך לערוך אותו.
                </Alert>
              )}
              <RoleAuthorizer user={user} allowedRoles={['judge-advisor', 'lead-judge']}>
                {rubric.status === 'in-progress' && (
                  <Alert
                    severity="info"
                    sx={{
                      fontWeight: 500,
                      border: '1px solid #03a9f4'
                    }}
                  >
                    כתיבת המחוון נמצאת בתהליך.
                  </Alert>
                )}
              </RoleAuthorizer>
              {rubric.status === 'completed' && (
                <Alert
                  severity="info"
                  sx={{
                    fontWeight: 500,
                    border: '1px solid #03a9f4'
                  }}
                >
                  כתיבת המחוון הושלמה, אך הוא טרם נשלח לאישור שופט מוביל.
                </Alert>
              )}
              {rubric.status === 'waiting-for-review' && (
                <Alert
                  severity="info"
                  sx={{
                    fontWeight: 500,
                    border: '1px solid #03a9f4'
                  }}
                >
                  מחוון זה ממתין לאישור שופט מוביל.
                </Alert>
              )}
            </Stack>

            <Table
              sx={{
                tableLayout: 'fixed',
                borderBottom: '1px solid rgba(0,0,0,0.2)',
                '@media print': {
                  fontSize: '0.75rem'
                }
              }}
              stickyHeader
            >
              <TableHead>
                <HeaderRow
                  columns={schema.columns}
                  category={schema.category}
                  hideDescriptions={schema.category !== 'core-values'}
                />
              </TableHead>
              {schema.sections.map(section => (
                <TableBody key={section.title}>
                  <TitleRow
                    title={section.title}
                    description={section.description}
                    category={schema.category}
                  />
                  {section.fields.map(field => (
                    <RatingRow
                      key={field.id}
                      name={`values.${field.id}`}
                      label_1={field.label_1}
                      label_2={field.label_2}
                      label_3={field.label_3}
                      label_4={field.label_4}
                      disabled={!isEditable}
                    />
                  ))}
                </TableBody>
              ))}
            </Table>

            <Stack sx={{ my: 4 }} direction="row" spacing={4}>
              {schema.feedback?.map(feedback => (
                <FormikTextField
                  key={feedback.id}
                  name={`feedback.${feedback.id}`}
                  label={feedback.title}
                  disabled={!isEditable}
                  spellCheck
                  multiline
                  minRows={4}
                />
              ))}
            </Stack>

            {!isValid && (
              <Alert
                severity="warning"
                sx={{
                  fontWeight: 500,
                  mb: 4,
                  maxWidth: '20rem',
                  mx: 'auto',
                  border: '1px solid #ff9800'
                }}
              >
                המחוון אינו מלא.
              </Alert>
            )}

            <Stack direction="row" spacing={4} justifyContent="center">
              <RoleAuthorizer user={user} allowedRoles={['judge']}>
                {['empty', 'in-progress', 'completed'].includes(rubric.status) && (
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => {
                      handleSync(true, values, 'waiting-for-review').then(() =>
                        router.push(`/event/${event._id}/${user.role}`)
                      );
                    }}
                    sx={{
                      minWidth: 120,
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#fff',
                      backgroundColor: purple[500],
                      '&:hover': {
                        backgroundColor: purple[700]
                      }
                    }}
                    disabled={!isValid}
                  >
                    נעילה ושליחה לשופט מוביל
                  </Button>
                )}
              </RoleAuthorizer>

              <RoleAuthorizer user={user} allowedRoles={['judge-advisor', 'lead-judge']}>
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => {
                    handleSync(false, values, 'ready').then(() =>
                      router.push(`/event/${event._id}/${user.role}`)
                    );
                  }}
                  sx={actionButtonStyle}
                  disabled={!isValid}
                >
                  הגשה סופית של המחוון
                </Button>

                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => {
                    resetForm({
                      values: getEmptyRubric()
                    });
                    handleSync(false, getEmptyRubric(), 'empty');
                  }}
                  sx={actionButtonStyle}
                >
                  איפוס המחוון
                </Button>
              </RoleAuthorizer>

              <RoleAuthorizer user={user} allowedRoles={['judge-advisor']}>
                {rubric.status === 'waiting-for-review' && (
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => {
                      handleSync(false, undefined, 'completed');
                    }}
                    sx={actionButtonStyle}
                  >
                    פתיחת גישה לשופטי החדר
                  </Button>
                )}

                {rubric.status === 'ready' && (
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => {
                      handleSync(false, undefined, 'waiting-for-review');
                    }}
                    sx={actionButtonStyle}
                  >
                    פתיחת גישה לשופט מוביל
                  </Button>
                )}
              </RoleAuthorizer>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default RubricForm;
