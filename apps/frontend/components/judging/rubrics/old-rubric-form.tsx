import React, { useEffect, useRef } from 'react';
import { WithId } from 'mongodb';
import { useSnackbar } from 'notistack';
import { Form, Formik, FormikContextType } from 'formik';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import { Socket } from 'socket.io-client';
import {
  Alert,
  Button,
  Grid,
  Stack,
  SxProps,
  Table,
  TableBody,
  TableHead,
  Theme,
  Typography
} from '@mui/material';
import { purple } from '@mui/material/colors';
import FeedbackNote from './feedback-note';
import RatingRow from './rating-row';
import HeaderRow from './header-row';
import TitleRow from './title-row';
import AwardCandidatureCheckbox from './award-candidature-checkbox';
import { RoleAuthorizer } from '../../role-authorizer';
import { RubricsSchema } from '../../../localization/rubric-schemas';
import {
  Event,
  SafeUser,
  Team,
  Rubric,
  RubricStatus,
  JudgingCategory,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';

interface Props {
  schema: RubricsSchema;
  event: WithId<Event>;
  team: WithId<Team>;
  data: WithId<Rubric<JudgingCategory>>;
  user: WithId<SafeUser>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  hideTitle?: boolean;
  hideDescription?: boolean;
}

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

const RubricsForm: React.FC<Props> = ({
  schema,
  event,
  team,
  data,
  user,
  socket,
  hideTitle = false,
  hideDescription = false
}) => {
  const initialized = useRef<boolean>(false);
  const router = useRouter();
  const formikRef = useRef<FormikContextType<any>>();
  const rubrics = schema.sections.flatMap(section => section.rubrics.map(rubric => rubric.id));
  const awardCandidates = schema.awards?.map(award => award.id) || [];
  const { enqueueSnackbar } = useSnackbar();

  const isActive =
    (user.role === 'judge' && ['empty', 'in-progress', 'completed'].includes(data.status)) ||
    (user.role === 'lead-judge' &&
      ['empty', 'in-progress', 'completed', 'waiting-for-review'].includes(data.status)) ||
    user.role === 'judge-advisor';

  const updateRubric = (
    eventId: string,
    teamId: string,
    rubricId: string,
    rubricData: Partial<Rubric<JudgingCategory>>
  ) => {
    socket.emit('updateRubric', eventId, teamId, rubricId, rubricData, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, שמירת המחוון נכשלה.', { variant: 'error' });
      }
    });
  };

  useEffect(() => {
    if (formikRef.current) {
      formikRef.current.validateForm();
    }
  }, []);

  return (
    <Formik
      initialValues={{
        ...rubrics.reduce(
          (values, field) => ({
            ...values,
            [field]: data.values?.[field] || {
              value: 0,
              note: ''
            }
          }),
          {}
        ),
        awards: {
          ...schema.awards?.reduce(
            (values, field) => ({
              ...values,
              [field.id]: data.awards?.[field.id] || false
            }),
            {}
          )
        },
        feedback: {
          ...schema.feedback?.reduce(
            (values, field) => ({
              ...values,
              [field.id]: data.notes?.[field.id] || ''
            }),
            {}
          )
        }
      }}
      validate={(values: Rubric<JudgingCategory>) => {
        const errors: FormikErrors<WithId<Rubric<JudgingCategory>>> = {};
        rubrics.forEach(rubric => {
          if (!values.values[rubric].value) {
            errors[rubric] = 'שדה חובה';
          } else if (values.values[rubric].value === '4' && !values.values[rubric].notes) {
            errors[rubric] = 'נדרש הסבר לציון';
          }
        });
        schema.feedback?.forEach(feedback => {
          if (!values.notes[feedback.id]) {
            errors[feedback.id] = 'שדה חובה';
          }
        });

        if (isActive && initialized.current) {
          const isCompleted = Object.keys(errors).length === 0;
          const isEmpty = Object.values(values).filter(x => !!x).length === 0;

          let newStatus = undefined;
          if (isEmpty) {
            newStatus = 'empty';
          } else if (!isCompleted) {
            newStatus = 'in-progress';
          } else if (isCompleted && ['empty', 'in-progress', 'completed'].includes(data.status)) {
            newStatus = 'completed';
          } else if (isCompleted && ['waiting-for-review', 'ready'].includes(data.status)) {
            newStatus = data.status;
          }
          values.status = newStatus as RubricStatus;
          updateRubric(event._id.toString(), team._id.toString(), data._id.toString(), values);
        }

        initialized.current = true;
        return errors;
      }}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={(values, actions) => {
        actions.setSubmitting(false);
      }}
    >
      {formik => {
        formikRef.current = formik;
        return (
          <Form>
            {!hideTitle && (
              <Typography variant="h2" sx={{ mb: 2 }}>
                {schema.title}
              </Typography>
            )}
            {(!hideDescription || (schema.awards?.length || 0) > 0) && (
              <Grid container spacing={6} sx={{ mb: 4 }}>
                {!hideDescription && (
                  <Grid item xs={12} md={(schema.awards?.length || 0) > 0 ? 5 : 9}>
                    <Typography color="text.secondary" fontSize="0.875rem">
                      <ReactMarkdown skipHtml components={{ p: React.Fragment }}>
                        {schema.description}
                      </ReactMarkdown>
                    </Typography>
                  </Grid>
                )}

                {schema.awards && schema.awards.length > 0 && (
                  <Grid item xs={12} md={7}>
                    <Typography variant="body2" gutterBottom>
                      אם הקבוצה הצטיינה באחד התחומים הבאים, נא לסמן את המשבצת המתאימה:
                    </Typography>
                    {schema.awards.map(award => (
                      <AwardCandidatureCheckbox
                        key={award.id}
                        name={`awards.${award.id}`}
                        title={award.title}
                        description={award.description}
                        disabled={!isActive}
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
              {!isActive && (
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
              {data.status === 'in-progress' && (
                <RoleAuthorizer user={user} allowedRoles={['judge-advisor', 'lead-judge']}>
                  <Alert
                    severity="info"
                    sx={{
                      fontWeight: 500,
                      border: '1px solid #03a9f4'
                    }}
                  >
                    כתיבת המחוון נמצאת בתהליך.
                  </Alert>
                </RoleAuthorizer>
              )}
              {data.status === 'completed' && (
                <Alert
                  severity="info"
                  sx={{
                    fontWeight: 500,
                    border: '1px solid #03a9f4'
                  }}
                >
                  כתיבת המחוון הושלמה, אך הוא טרם נשלח לאישור שופט ראשי.
                </Alert>
              )}
              {data.status === 'waiting-for-review' && (
                <Alert
                  severity="info"
                  sx={{
                    fontWeight: 500,
                    border: '1px solid #03a9f4'
                  }}
                >
                  מחוון זה ממתין לאישור שופט ראשי.
                </Alert>
              )}
            </Stack>

            <div>
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
                  <HeaderRow columns={schema.columns} category={schema.category} />
                </TableHead>
                {schema.sections.map(section => (
                  <TableBody key={section.title}>
                    <TitleRow
                      title={section.title}
                      description={section.description}
                      category={schema.category}
                    />
                    {section.rubrics.map(rubric => (
                      <RatingRow
                        key={rubric.id}
                        name={rubric.id}
                        label_1={rubric.label_1}
                        label_2={rubric.label_2}
                        label_3={rubric.label_3}
                        label_4={rubric.label_4}
                        disabled={!isActive}
                      />
                    ))}
                  </TableBody>
                ))}
              </Table>
            </div>
            <div>
              <Stack sx={{ my: 4 }} direction="row" spacing={4}>
                {schema.feedback?.map(feedback => (
                  <FeedbackNote
                    key={feedback.id}
                    name={`feedback.${feedback.id}`}
                    label={feedback.title}
                    disabled={!isActive}
                  />
                ))}
              </Stack>
            </div>

            {!formik.isValid && (
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
              <RoleAuthorizer user={user} allowedRoles="judge">
                {['empty', 'in-progress', 'completed'].includes(data.status) && (
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => {
                      updateRubric(event._id.toString(), team._id.toString(), data._id.toString(), {
                        status: 'waiting-for-review',
                        ...formikRef?.current?.values
                      });
                      router.push(`/event/${event._id}`);
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
                    disabled={!formik.isValid}
                  >
                    נעילה ושליחה לשופט ראשי
                  </Button>
                )}
              </RoleAuthorizer>

              <RoleAuthorizer user={user} allowedRoles="judge-advisor">
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => {
                    updateRubric(event._id.toString(), team._id.toString(), data._id.toString(), {
                      status: 'ready'
                    });
                    router.push(`/event/${event._id}`);
                  }}
                  sx={actionButtonStyle}
                  disabled={!formik.isValid}
                >
                  הגשה סופית של המחוון
                </Button>
              </RoleAuthorizer>

              <RoleAuthorizer user={user} allowedRoles="judge-advisor">
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => {
                    // Reset form with blank values
                    // The initial values are not used because they are the values
                    // from initial fetching, so they may contain some values from last save
                    formikRef.current?.resetForm({
                      values: {
                        ...rubrics.reduce((fields, field) => ({ ...fields, [field]: {} }), {}),
                        ...awardCandidates.reduce(
                          (fields: any, field) => ({ ...fields, [field]: false }),
                          {}
                        ),
                        ...schema.feedback?.reduce(
                          (fields, field) => ({ ...fields, [field.id]: '' }),
                          {}
                        )
                      }
                    });
                    setTimeout(() => formikRef.current?.validateForm(), 100);
                  }}
                  sx={actionButtonStyle}
                >
                  איפוס המחוון
                </Button>
              </RoleAuthorizer>

              <RoleAuthorizer user={user} allowedRoles="judge-advisor">
                {data.status === 'waiting-for-review' && (
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => {
                      updateRubric(event._id.toString(), team._id.toString(), data._id.toString(), {
                        status: 'ready'
                      });
                    }}
                    sx={actionButtonStyle}
                  >
                    פתיחת גישה לשופטי החדר
                  </Button>
                )}
              </RoleAuthorizer>

              <RoleAuthorizer user={user} allowedRoles="judge-advisor">
                {data.status === 'ready' && (
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => {
                      updateRubric(event._id.toString(), team._id.toString(), data._id.toString(), {
                        status: 'waiting-for-review'
                      });
                    }}
                    sx={actionButtonStyle}
                  >
                    פתיחת גישה לשופט ראשי
                  </Button>
                )}
              </RoleAuthorizer>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
};

export default RubricsForm;
