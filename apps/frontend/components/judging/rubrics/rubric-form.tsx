import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { Form, Formik, FormikValues } from 'formik';
import Markdown from 'react-markdown';
import {
  Typography,
  Button,
  Table,
  Alert,
  Stack,
  TableHead,
  TableBody,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SxProps,
  Theme
} from '@mui/material';
import { purple } from '@mui/material/colors';
import Grid from '@mui/material/Grid2';
import {
  Division,
  Team,
  Rubric,
  JudgingCategory,
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  SafeUser,
  RubricValue
} from '@lems/types';
import { fullMatch } from '@lems/utils/objects';
import { RubricsSchema, localizedJudgingCategory } from '@lems/season';
import AwardCandidatureCheckbox from './award-candidature-checkbox';
import RatingRow from './rating-row';
import HeaderRow from './header-row';
import TitleRow from './title-row';
import FeedbackRow from './feedback-row';
import { enqueueSnackbar } from 'notistack';
import { RoleAuthorizer } from '../../role-authorizer';
import { localizeTeam } from '../../../localization/teams';
import CvFieldUncheckedIcon from '../../icons/CvFieldUncheckedIcon';

interface RubricFormProps {
  division: WithId<Division>;
  team: WithId<Team>;
  rubric: WithId<Rubric<JudgingCategory>>;
  schema: RubricsSchema;
  user: WithId<SafeUser>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  hideTitle?: boolean;
  hideDescription?: boolean;
}

const RubricForm: React.FC<RubricFormProps> = ({
  division,
  team,
  rubric,
  schema,
  user,
  socket,
  hideTitle = false,
  hideDescription = false
}) => {
  const router = useRouter();
  const [resetDialog, setResetDialog] = useState<boolean>(false);

  const fields = schema.sections.flatMap(section => section.fields.map(field => field.id));
  const awardCandidates = schema.awards?.map(award => award.id) || [];

  const isEditable =
    (user.role === 'judge' && ['empty', 'in-progress', 'completed'].includes(rubric.status)) ||
    (user.role === 'lead-judge' &&
      ['empty', 'in-progress', 'completed', 'waiting-for-review'].includes(rubric.status)) ||
    user.role === 'judge-advisor';

  const getEmptyRubric = () => {
    const awards: { [key in (typeof awardCandidates)[number]]: boolean } = {} as {
      [key in (typeof awardCandidates)[number]]: boolean;
    };
    awardCandidates.map(award => (awards[award] = false));

    const values: { [key in (typeof fields)[number]]: RubricValue } = {} as {
      [key in (typeof fields)[number]]: RubricValue;
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
      division._id.toString(),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: any = {};

    fields.forEach(field => {
      if (!formValues.values[field].value) {
        errors[field] = 'שדה חובה';
      } else if (formValues.values[field].value === 4 && !formValues.values[field].notes) {
        errors[field] = 'נדרש הסבר לציון';
      }
    });

    Object.entries(schema.feedback?.fields ?? {}).forEach(([key, value]) => {
      if (!formValues.feedback[key]) {
        errors[key] = 'שדה חובה';
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
        {({ values, isValid, resetForm, validateForm }) => (
          <Form>
            {!hideTitle && (
              <Typography variant="h2" sx={{ mb: 2 }}>
                {schema.title}
              </Typography>
            )}
            {!hideDescription && (
              <Grid container spacing={6} sx={{ mb: 4 }}>
                {!hideDescription && (
                  <Grid
                    size={{
                      xs: 12,
                      md: 9
                    }}
                  >
                    <Markdown skipHtml>{schema.description}</Markdown>
                  </Grid>
                )}
              </Grid>
            )}
            {schema.awards && schema.awards.length > 0 && (
              <Stack>
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
              </Stack>
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
                pb: 2,
                tableLayout: 'fixed',
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
              <TableBody>
                {schema.sections.map((section, index) => (
                  <React.Fragment key={index}>
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
                        isCoreValuesField={field.isCoreValuesField}
                      />
                    ))}
                  </React.Fragment>
                ))}
                {schema.feedback && (
                  <FeedbackRow
                    description={schema.feedback.description}
                    feedback={schema.feedback.fields}
                    isEditable={isEditable}
                    category={rubric.category}
                  />
                )}
              </TableBody>
            </Table>

            {schema.cvDescription && (
              <Stack direction="row" spacing={2} sx={{ pb: 1 }}>
                <CvFieldUncheckedIcon />
                <Markdown>{schema.cvDescription}</Markdown>
              </Stack>
            )}

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
                        router.push(`/lems/${user.role}`)
                      );
                    }}
                    sx={actionButtonStyle}
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
                    handleSync(false, values, 'ready').then(() => {
                      router.push(`/lems/${user.role}?tab=1#${team.number.toString()}`);
                    });
                  }}
                  sx={actionButtonStyle}
                  disabled={!isValid}
                >
                  הגשה סופית של המחוון
                </Button>

                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => setResetDialog(true)}
                  disabled={rubric.status === 'empty'}
                  sx={actionButtonStyle}
                >
                  איפוס המחוון
                </Button>
                <Dialog
                  open={resetDialog}
                  onClose={() => setResetDialog(false)}
                  aria-labelledby="reset-dialog-title"
                  aria-describedby="reset-dialog-description"
                >
                  <DialogTitle id="reset-dialog-title">איפוס המוון</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="reset-dialog-description">
                      {`איפוס המחוון ימחק את הניקוד של הקבוצה, ללא אפשרות שחזור. האם אתם
                      בטוחים שברצונכם למחוק את מחוון שיפוט ${localizedJudgingCategory[rubric.category].name} 
                      של קבוצה ${localizeTeam(team)}?`}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setResetDialog(false)} autoFocus>
                      ביטול
                    </Button>
                    <Button
                      onClick={() => {
                        handleSync(true, getEmptyRubric(), 'empty');
                        resetForm({ values: getEmptyRubric() });
                        validateForm();
                        setResetDialog(false);
                      }}
                    >
                      אישור
                    </Button>
                  </DialogActions>
                </Dialog>

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
              </RoleAuthorizer>

              <RoleAuthorizer user={user} allowedRoles={['judge-advisor']}>
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
