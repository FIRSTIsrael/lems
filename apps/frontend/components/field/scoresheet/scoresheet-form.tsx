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
  Box,
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
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SignatureCanvas from 'react-signature-canvas';
import Image from 'next/image';
import {
  Division,
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
import { localizeTeam } from '../../../localization/teams';
import { localizedMatchStage } from '../../../localization/field';

interface ScoresheetFormProps {
  division: WithId<Division>;
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
  user: WithId<SafeUser>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  emptyScoresheetValues?: Array<Mission>;
}

const ScoresheetForm: React.FC<ScoresheetFormProps> = ({
  division,
  team,
  scoresheet,
  user,
  socket,
  emptyScoresheetValues
}) => {
  const router = useRouter();
  const [readOnly, setReadOnly] = useState<boolean>(
    user.role === 'head-referee' && !['empty', 'waiting-for-head-ref', 'waiting-for-head-ref-gp'].includes(scoresheet.status)
  );

  interface ErrorWithMessage {
    id: string;
    description: string;
  }

  interface MissionInfo {
    id: string;
    incomplete?: boolean;
    errors?: Array<ErrorWithMessage>;
  }
  const [missionInfo, setMissionInfo] = useState<Array<MissionInfo>>([]);
  const [validatorErrors, setValidatorErrors] = useState<Array<ErrorWithMessage>>([]);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [headRefDialog, setHeadRefDialog] = useState<boolean>(false);
  const [resetDialog, setResetDialog] = useState<boolean>(false);

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
    const missionErrors: Array<ErrorWithMessage> = [];

    SEASON_SCORESHEET.missions.forEach((mission, missionIndex) => {
      const clauses = values.missions[missionIndex].clauses;
      try {
        score += mission.calculation(...clauses.map((clause: MissionClause) => clause.value));
      } catch (error: any) {
        if (error instanceof ScoresheetError) {
          const localizedErrors = localizedScoresheet.missions[missionIndex].errors;
          if (localizedErrors && localizedErrors.length > 0) {
            const localizedError = localizedErrors.find(e => e.id === error.id);
            if (localizedError) missionErrors.push(localizedError);
          }
        }
      }
    });
    return { score, missionErrors };
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
      division._id.toString(),
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
    const newMissionInfo: Array<MissionInfo> = SEASON_SCORESHEET.missions.map(m => {
      return { id: m.id };
    });

    const { score, missionErrors } = calculateScore(formValues);
    if (missionErrors.length > 0) errors['score'] = 'דף הניקוד אינו תקין';

    missionErrors.forEach(e => {
      const missionId = e.id.slice(0, 3);
      const index = newMissionInfo.findIndex(mi => mi.id === missionId);
      if (index > -1) {
        if (!newMissionInfo[index].errors) newMissionInfo[index].errors = [];
        newMissionInfo[index].errors!.push(e);
      }
    });

    formValues.missions.forEach((mission: Mission) => {
      mission.clauses.forEach((clause: MissionClause) => {
        if (clause.value === null) {
          errors['missions'] = 'דף הניקוד אינו מלא';
          const index = newMissionInfo.findIndex(mi => mi.id === mission.id);
          if (index > -1) {
            newMissionInfo[index]['incomplete'] = true;
          }
        }
      });
    });

    setMissionInfo(newMissionInfo);

    const validatorErrors: Array<ErrorWithMessage> = [];
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
    setValidatorErrors(validatorErrors);

    if (signatureRef.current?.isEmpty() && formValues.signature?.length === 0) {
      errors.signature = 'הקבוצה טרם חתמה על דף הניקוד';
    }

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
                      errors={missionInfo.find(e => e?.id == mission.id)?.errors}
                      readOnly={readOnly}
                    />
                  ))}
                </Stack>

                <Stack spacing={2} alignItems="center" my={6}>
                  {readOnly ||
                  validatorErrors.length > 0 ||
                  missionInfo.find(mi => mi.incomplete || !!mi.errors) ||
                  (values.signature && values.signature.length > 0) ? (
                    <Image
                      src={values.signature || '/assets/scoresheet/blank-signature.svg'}
                      alt={`חתימת קבוצה #${team.number}`}
                      width={400}
                      height={200}
                      style={{ borderRadius: '8px', border: '1px solid #f1f1f1' }}
                    />
                  ) : (
                    <Stack direction="row" spacing={2}>
                      {signatureRef.current &&
                        !['ready', 'waiting-for-gp'].includes(scoresheet.status) && (
                          <Box display="flex" alignItems="center">
                            <IconButton
                              onClick={() => {
                                signatureRef.current?.clear();
                                validateForm();
                              }}
                            >
                              <RestartAltRoundedIcon />
                            </IconButton>
                          </Box>
                        )}
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
                        const invalidMission = missionInfo.find(mi => mi.incomplete || mi.errors);
                        if (invalidMission) window.location.href = `#${invalidMission.id}`;
                      }}
                    >
                      {Object.keys(errors).length === 1 && !!errors.signature
                        ? 'הקבוצה טרם חתמה על דף הניקוד.'
                        : 'דף הניקוד אינו מלא.'}
                    </Alert>
                  )}
                  {validatorErrors.map((e: ErrorWithMessage) => (
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
                          setHeadRefDialog(true);
                        }}
                      >
                        העברת דף הניקוד לשופט ראשי
                      </Button>
                      <Dialog
                        open={headRefDialog}
                        onClose={() => setHeadRefDialog(false)}
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
                          <Button onClick={() => setHeadRefDialog(false)} autoFocus>
                            ביטול
                          </Button>
                          <Button
                            onClick={() => {
                              handleSync(true, values, 'waiting-for-head-ref');
                              setHeadRefDialog(false);
                            }}
                          >
                            אישור
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </RoleAuthorizer>
                    <RoleAuthorizer user={user} allowedRoles={['head-referee']}>
                      <Button
                        variant="contained"
                        sx={{ minWidth: 200 }}
                        disabled={scoresheet.status === 'empty'}
                        onClick={() => setResetDialog(true)}
                      >
                        איפוס דף הניקוד
                      </Button>
                      <Dialog
                        open={resetDialog}
                        onClose={() => setResetDialog(false)}
                        aria-labelledby="reset-dialog-title"
                        aria-describedby="reset-dialog-description"
                      >
                        <DialogTitle id="reset-dialog-title">איפוס דף הניקוד</DialogTitle>
                        <DialogContent>
                          <DialogContentText id="reset-dialog-description">
                            {`איפוס דף הניקוד ימחק את הניקוד של הקבוצה, ללא אפשרות שחזור. האם אתם
                            בטוחים שברצונכם למחוק את דף הניקוד של קבוצה ${localizeTeam(team)} במקצה
                            ${localizedMatchStage[scoresheet.stage]} #${scoresheet.round}?`}
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setResetDialog(false)} autoFocus>
                            ביטול
                          </Button>
                          <Button
                            onClick={() => {
                              handleSync(true, getDefaultScoresheet(), 'empty');
                              setResetDialog(false);
                            }}
                          >
                            אישור
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </RoleAuthorizer>
                    <Button
                      variant="contained"
                      sx={{ minWidth: 200 }}
                      endIcon={<ChevronLeftIcon />}
                      disabled={!isValid}
                      onClick={() => handleSync(true, values, user.role === 'head-referee' ? 'waiting-for-head-ref-gp' : 'waiting-for-gp', true)}
                    >
                      המשך
                    </Button>
                  </Stack>
                </Stack>
              </>
            ) : (
              <GpSelector
                user={user}
                scoresheetStatus={scoresheet.status}
                onBack={() => handleSync(false, values, 'completed')}
                onSubmit={() => {
                  handleSync(true, values, 'ready').then(() => router.push(`/lems/${user.role}`));
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
