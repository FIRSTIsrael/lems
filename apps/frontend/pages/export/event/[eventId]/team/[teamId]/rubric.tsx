import { ObjectId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { Paper, Box } from '@mui/material';
import { JudgingRoom, JudgingSession } from '@lems/types';
import { rubricsSchemas } from '@lems/season';
import Layout from '../../../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../../../lib/utils/fetch';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Form, Formik, FormikValues } from 'formik';
import Markdown from 'react-markdown';
import { Typography, Table, Alert, Stack, TableHead, TableBody } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Event, Team, Rubric, JudgingCategory, SafeUser, RubricValue } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import FormikTextField from '../../../../../../components/general/forms/formik-text-field';
import RatingRow from '../../../../../../components/judging/rubrics/rating-row';
import HeaderRow from '../../../../../../components/judging/rubrics/header-row';
import TitleRow from '../../../../../../components/judging/rubrics/title-row';
import { enqueueSnackbar } from 'notistack';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';
import { localizeTeam } from '../../../../../../localization/teams';
import AwardCandidatureCheckbox from '../../../../../../components/judging/rubrics/award-candidature-checkbox';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  room: WithId<JudgingRoom>;
  team: WithId<Team>;
  // session: WithId<JudgingSession>;
  rubrics: WithId<Rubric<JudgingCategory>>[];
}

const Page: NextPage<Props> = ({
  user,
  event,
  room,
  team,
  // session,
  rubrics
}) => {
  const router = useRouter();
  if (!team.registered) {
    router.push(`/event/${event._id}/${user.role}`);
    enqueueSnackbar('הקבוצה טרם הגיעה לאירוע.', { variant: 'info' });
  }
  // if (session.status !== 'completed') {
  //   router.push(`/event/${event._id}/${user.role}`);
  //   enqueueSnackbar('מפגש השיפוט טרם נגמר.', { variant: 'info' });
  // }

  return (
    // <RoleAuthorizer
    //   user={user}
    //   allowedRoles={['judge', 'judge-advisor']}
    //   conditionalRoles={'lead-judge'}
    //   conditions={{}}
    //   // conditions={{ roleAssociation: { type: 'category', value: judgingCategory } }}
    //   onFail={() => router.push(`/export/event/${event._id}/${user.role}`)}
    // >
    <>
      {team &&
        Object.keys(localizedJudgingCategory).map(judgingCategory => {
          const rubric = rubrics.find(rubric => rubric.category === judgingCategory);
          if (!rubric) return null;

          const schema = rubricsSchemas[judgingCategory as JudgingCategory];
          const awardCandidates = schema.awards?.map(award => award.id) || [];
          const fields = schema.sections.flatMap(section => section.fields.map(field => field.id));

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

            return errors;
          };

          return (
            <div
              key={judgingCategory}
              css={{
                width: '100%',
                padding: '1rem',
                boxSizing: 'border-box',
                pageBreakAfter: 'always'
              }}
            >
              <Paper sx={{ p: 3, mt: 4, mb: 2 }}>
                <Typography variant="h2" fontSize="1.25rem" fontWeight={500} align="center">
                  {localizeTeam(team)} | חדר שיפוט {room.name}
                </Typography>
              </Paper>

              <Box my={4}>
                <>
                  <Formik
                    initialValues={rubric.data || getEmptyRubric()}
                    validate={validateRubric}
                    validateOnMount
                    onSubmit={() => undefined}
                  >
                    {({ isValid }) => (
                      <Form>
                        <Typography variant="h2" sx={{ mb: 2 }}>
                          {schema.title}
                        </Typography>

                        <Grid container spacing={6} sx={{ mb: 4 }}>
                          <Grid xs={12} md={(schema.awards?.length || 0) > 0 ? 5 : 9}>
                            <Typography color="text.secondary" fontSize="0.875rem" component="span">
                              <Markdown skipHtml>{schema.description}</Markdown>
                            </Typography>
                          </Grid>

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
                                  disabled
                                />
                              ))}
                            </Grid>
                          )}
                        </Grid>

                        <Stack
                          spacing={2}
                          sx={{
                            maxWidth: '20rem',
                            mx: 'auto',
                            my: 4
                          }}
                        >
                          <Alert
                            severity="warning"
                            sx={{
                              fontWeight: 500,
                              border: '1px solid #ff9800'
                            }}
                          >
                            המחוון נעול, אין באפשרותך לערוך אותו.
                          </Alert>

                          {/* <RoleAuthorizer
                            user={user}
                            allowedRoles={['judge-advisor', 'lead-judge']}
                          > */}
                          <>
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
                          </>
                          {/* </RoleAuthorizer> */}
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
                          // stickyHeader
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
                                  disabled
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
                              disabled
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

                        {/* <Stack direction="row" spacing={4} justifyContent="center">
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
                                sx={actionButtonStyle}
                                disabled={!isValid}
                              >
                                נעילה ושליחה לשופט מוביל
                              </Button>
                            )}
                          </RoleAuthorizer>

                          <RoleAuthorizer
                            user={user}
                            allowedRoles={['judge-advisor', 'lead-judge']}
                          >
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
                        </Stack> */}
                      </Form>
                    )}
                  </Formik>
                </>
                {/* <RubricForm
                  event={event}
                  team={team}
                  user={user}
                  rubric={rubric}
                  schema={rubricsSchemas[judgingCategory as JudgingCategory]}
                  // socket={socket}
                /> */}
              </Box>
            </div>
          );
        })}
    </>
    // </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    let roomId;
    if (user.roleAssociation && user.roleAssociation.type === 'room') {
      roomId = user.roleAssociation.value;
    } else {
      const sessions = await apiFetch(`/api/events/${user.eventId}/sessions`, undefined, ctx).then(
        res => res?.json()
      );
      roomId = sessions.find(
        (session: JudgingSession) => session.teamId == new ObjectId(String(ctx.params?.teamId))
      ).roomId;
    }

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        team: `/api/events/${user.eventId}/teams/${ctx.params?.teamId}`,
        room: `/api/events/${user.eventId}/rooms/${roomId}`,
        // session: `/api/events/${user.eventId}/rooms/${roomId}/sessions`,
        rubrics: `/api/events/${user.eventId}/teams/${ctx.query.teamId}/rubrics`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return {};
  }
};

export default Page;
