import React, { useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { Form, Formik, FormikValues } from 'formik';
import {
  Typography,
  Button,
  Alert,
  Stack,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SignatureCanvas from 'react-signature-canvas';
import Image from 'next/image';
import {
  Event,
  Team,
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  SafeUser,
  Scoresheet,
  MissionClause,
  Mission,
  ScoresheetStatus
} from '@lems/types';
import { fullMatch } from '@lems/utils/objects';
import {
  SEASON_SCORESHEET,
  ALLOW_SCORESHEET_DEFAULTS,
  ScoresheetError,
  localizedScoresheet
} from '@lems/season';
import { enqueueSnackbar } from 'notistack';
import ScoresheetMission from './scoresheet-mission';
import GpSelector from './gp';
import { RoleAuthorizer } from '../../role-authorizer';

interface ScoresheetFormProps {
  event: WithId<Event>;
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
  user: WithId<SafeUser>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  emptyScoresheetValues?: Array<Mission>;
}

const ScoresheetForm: React.FC<ScoresheetFormProps> = ({
  event,
  team,
  scoresheet,
  user,
  socket,
  emptyScoresheetValues
}) => {
  const router = useRouter();
  const [readOnly, setReadOnly] = useState<boolean>(
    user.role === 'head-referee' && !['empty', 'waiting-for-head-ref'].includes(scoresheet.status)
  );

  const [missionErrors, setMissionErrors] = useState<
    Array<{ id: string; description: string } | undefined>
  >([]);
  const [scoresheetErrors, setScoresheetErrors] = useState<
    Array<{ id: string; description: string }>
  >([]);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [headRefDialogue, setHeadRefDialogue] = useState<boolean>(false);

  const mode = useMemo(() => {
    return scoresheet.status === 'waiting-for-gp' ? 'gp' : 'scoring';
  }, [scoresheet]);

  const getDefaultScoresheet = () => {
    const missions: Array<Mission> = SEASON_SCORESHEET.missions.map(mission => {
      return {
        id: mission.id,
        clauses: mission.clauses.map((c, index) => {
          let value = emptyScoresheetValues?.find(m => m.id === mission.id)?.clauses[index].value;
          if (value === undefined) value = ALLOW_SCORESHEET_DEFAULTS ? c.default : null;
          return { type: c.type, value };
        })
      };
    });

    return { missions: missions, signature: '', gp: null, score: 0 };
  };

  const calculateScore = (values: FormikValues) => {
    let score = 0;
    const scoringErrors: Array<{ id: string; description: string } | undefined> = [];

    SEASON_SCORESHEET.missions.forEach((mission, missionIndex) => {
      const clauses = values.missions[missionIndex].clauses;
      try {
        score += mission.calculation(...clauses.map((clause: MissionClause) => clause.value));
      } catch (error: any) {
        if (error instanceof ScoresheetError) {
          const localizedErrors = localizedScoresheet.missions[missionIndex].errors;
          if (localizedErrors && localizedErrors.length > 0)
            scoringErrors.push(localizedErrors.find(e => e.id === error.id));
        }
      }
    });
    return { score, scoringErrors };
  };

  const handleSync = async (
    showSnackbar: boolean,
    formValues: FormikValues | undefined,
    newStatus: ScoresheetStatus | undefined,
    saveSignature = false
  ) => {
    const updatedScoresheet = {} as Partial<Scoresheet>;
    if (newStatus) updatedScoresheet.status = newStatus;
    if (formValues) (updatedScoresheet as any).data = formValues;
    if (saveSignature && signatureRef.current && updatedScoresheet.data)
      updatedScoresheet.data.signature = signatureRef.current.getCanvas().toDataURL('image/png');

    socket.emit(
      'updateScoresheet',
      event._id.toString(),
      team._id.toString(),
      scoresheet._id.toString(),
      updatedScoresheet as Partial<Scoresheet>,
      response => {
        if (response.ok) {
          if (showSnackbar) {
            enqueueSnackbar(
              updatedScoresheet.data?.gp
                ? 'דירוג המקצועיות האדיבה נשמר בהצלחה.'
                : 'דף הניקוד נשמר בהצלחה.',
              { variant: 'success' }
            );
          }
        } else {
          enqueueSnackbar('אופס, שמירת דף הניקוד נכשלה.', { variant: 'error' });
        }
      }
    );
  };

  const validateScoresheet = (formValues: FormikValues) => {
    const errors: any = {};

    const { score, scoringErrors } = calculateScore(formValues);
    setMissionErrors(scoringErrors);
    scoringErrors.forEach(e => {
      if (!errors.scoring) errors['scoring'] = {};
      if (e) errors.scoring[e.id] = e.description;
    });

    formValues.missions.forEach((m: Mission, missionIndex: number) => {
      m.clauses.forEach((c: MissionClause, clauseIndex: number) => {
        if (c.value === null) {
          if (!errors[missionIndex]) errors[missionIndex] = { clauses: [] };
          errors[missionIndex].clauses[clauseIndex] = 'שדה חובה';
        }
      });
    });

    if (signatureRef.current?.isEmpty() && formValues.signature?.length === 0) {
      errors.signature = 'הקבוצה טרם חתמה על דף הניקוד';
    }

    const validatorErrors: Array<{ id: string; description: string }> = [];
    const toValidate = Object.fromEntries(
      formValues.missions.map((m: Mission) => [m.id, m.clauses.map((c: MissionClause) => c.value)])
    );
    SEASON_SCORESHEET.validators.forEach(validator => {
      try {
        validator(toValidate);
      } catch (error: any) {
        if (error instanceof ScoresheetError) {
          const description =
            localizedScoresheet.errors.find(e => e.id == error.id)?.description || '';
          errors[error.id] = description;
          validatorErrors.push({ id: error.id, description });
        }
      }
    });
    setScoresheetErrors(validatorErrors);

    if (mode === 'gp') {
      if (formValues.gp?.value !== '3' && !formValues.gp?.notes)
        errors.gp = 'נדרש הסבר לציון המקצועיות האדיבה';
    }

    const isCompleted = Object.keys(errors).length === 0;
    const isEmpty = fullMatch(formValues, getDefaultScoresheet());

    let newStatus: ScoresheetStatus | undefined = undefined;
    if (['empty', 'in-progress', 'completed'].includes(scoresheet.status)) {
      if (isEmpty) {
        newStatus = 'empty';
      } else if (!isCompleted) {
        newStatus = 'in-progress';
      } else if (isCompleted) {
        newStatus = 'completed';
      }
    } else {
      newStatus = scoresheet.status;
    }

    formValues.score = score;

    if (!fullMatch(scoresheet.data, formValues) || scoresheet.status !== newStatus) {
      handleSync(false, formValues, newStatus);
    }

    return errors;
  };

  return (
    <>
      <Formik
        initialValues={scoresheet.data || getDefaultScoresheet()}
        validate={validateScoresheet}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false);
        }}
        enableReinitialize
        validateOnChange
        validateOnMount
      >
        {({ values, isValid, errors, validateForm }) => (
          <Form>
            {mode === 'scoring' ? (
              <>
                <Paper
                  sx={{
                    p: 4,
                    my: 2,
                    position: 'sticky',
                    top: '4rem',
                    zIndex: 1
                  }}
                >
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Typography fontSize="1.5rem" fontWeight={600} align="center">
                      {values.score} נקודות
                    </Typography>
                    <RoleAuthorizer user={user} allowedRoles={['head-referee']}>
                      <IconButton
                        onClick={() => setReadOnly(prev => !prev)}
                        size="small"
                        sx={{ color: '#000000de' }}
                      >
                        {readOnly ? <ModeEditIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </RoleAuthorizer>
                  </Stack>
                </Paper>

                <Stack spacing={4}>
                  {SEASON_SCORESHEET.missions.map((mission, index) => (
                    <ScoresheetMission
                      key={mission.id}
                      missionIndex={index}
                      src={`/assets/scoresheet/missions/${mission.id}.webp`}
                      mission={mission}
                      errors={missionErrors.filter(e => e?.id.startsWith(mission.id))}
                      readOnly={readOnly}
                    />
                  ))}
                </Stack>

                <Stack spacing={2} alignItems="center" my={6}>
                  {readOnly || (values.signature && values.signature.length > 0) ? (
                    <Image
                      src={values.signature || '/assets/scoresheet/blank-signature.svg'}
                      alt={`חתימת קבוצה #${team.number}`}
                      width={400}
                      height={200}
                      style={{ borderRadius: '8px', border: '1px solid #f1f1f1' }}
                    />
                  ) : (
                    <SignatureCanvas
                      canvasProps={{
                        width: 400,
                        height: 200,
                        style: { borderRadius: '8px', border: '1px solid #f1f1f1' }
                      }}
                      backgroundColor="#fff"
                      ref={ref => {
                        signatureRef.current = ref;
                      }}
                      onEnd={() => validateForm()}
                    />
                  )}
                  {!isValid && (
                    <Alert
                      severity="warning"
                      sx={{
                        fontWeight: 500,
                        mb: 4,
                        maxWidth: '20rem',
                        mx: 'auto',
                        border: '1px solid #ff9800',
                        transition: theme =>
                          theme.transitions.create(['background-color'], {
                            duration: theme.transitions.duration.standard
                          }),
                        '&:hover': {
                          cursor: 'pointer',
                          backgroundColor: '#ffe3a6'
                        }
                      }}
                      onClick={e => {
                        e.preventDefault();
                        window.location.href = `#${parseInt(Object.keys(errors)[0]) - 1}`;
                      }}
                    >
                      {Object.keys(errors).length === 1 && !!errors.signature
                        ? 'הקבוצה טרם חתמה על דף הניקוד.'
                        : 'דף הניקוד אינו מלא.'}
                    </Alert>
                  )}
                  {scoresheetErrors.map((e: { id: string; description: string }) => (
                    <Alert
                      severity="error"
                      key={e.id}
                      sx={{
                        fontWeight: 500,
                        mb: 4,
                        maxWidth: '20rem',
                        mx: 'auto',
                        border: '1px solid #ff2f00'
                      }}
                    >
                      {e.description}
                    </Alert>
                  ))}

                  <Stack direction="row" spacing={2}>
                    <RoleAuthorizer user={user} allowedRoles={['referee']}>
                      <Button
                        variant="contained"
                        sx={{
                          minWidth: 200
                        }}
                        endIcon={<SportsScoreIcon />}
                        onClick={() => {
                          setHeadRefDialogue(true);
                        }}
                      >
                        העברת דף הניקוד לשופט ראשי
                      </Button>
                      <Dialog
                        open={headRefDialogue}
                        onClose={() => setHeadRefDialogue(false)}
                        aria-labelledby="headref-dialog-title"
                        aria-describedby="headref-dialog-description"
                      >
                        <DialogTitle id="headref-dialog-title">
                          העברת דף הניקוד לשופט הראשי
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText id="headref-dialog-description">
                            העברת דף הניקוד לשופט זירה ראשי תנעל את דף הניקוד ותעביר אותך למקצה הבא.
                            לא תוכלו להמשיך את תהליך הניקוד עם הקבוצה. האם אתם בטוחים?
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setHeadRefDialogue(false)} autoFocus>
                            ביטול
                          </Button>
                          <Button onClick={() => handleSync(true, values, 'waiting-for-head-ref')}>
                            אישור
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </RoleAuthorizer>
                    <RoleAuthorizer user={user} allowedRoles={['head-referee']}>
                      <Button
                        variant="contained"
                        sx={{
                          minWidth: 200
                        }}
                        disabled={values === getDefaultScoresheet()}
                        onClick={() => handleSync(true, getDefaultScoresheet(), 'empty')}
                      >
                        איפוס דף הניקוד
                      </Button>
                    </RoleAuthorizer>
                    <Button
                      variant="contained"
                      sx={{ minWidth: 200 }}
                      endIcon={<ChevronLeftIcon />}
                      disabled={!isValid}
                      onClick={() => handleSync(true, values, 'waiting-for-gp', true)}
                    >
                      המשך
                    </Button>
                  </Stack>
                </Stack>
              </>
            ) : (
              <GpSelector
                user={user}
                onBack={() => handleSync(false, values, 'completed')}
                onSubmit={() => {
                  handleSync(true, values, 'ready').then(() =>
                    router.push(`/event/${event._id}/${user.role}`)
                  );
                }}
              />
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ScoresheetForm;
