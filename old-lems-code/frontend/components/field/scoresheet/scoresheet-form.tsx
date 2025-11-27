import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { Form, Formik, FormikValues } from 'formik';
import {
  Typography,
  Button,
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
import ScoresheetAlert from './scoresheet-alert';
import GpSelector from './gp';
import { RoleAuthorizer } from '../../role-authorizer';
import { localizeTeam } from '../../../localization/teams';
import { localizedMatchStage } from '../../../localization/field';
import ScoresheetSignature from './scoresheet-signature';

interface ErrorWithMessage {
  id: string;
  description: string;
}

interface MissionInfo {
  id: string;
  incomplete?: boolean;
  errors?: Array<ErrorWithMessage>;
}

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
  const signatureRef = useRef<SignatureCanvas | null>(null);

  const [readOnly, setReadOnly] = useState<boolean>(
    user.role === 'head-referee' && scoresheet.status !== 'empty' && !scoresheet.escalated
  );
  const [missionInfo, setMissionInfo] = useState<Array<MissionInfo>>([]);
  const [validatorErrors, setValidatorErrors] = useState<Array<ErrorWithMessage>>([]);
  const [headRefDialog, setHeadRefDialog] = useState<boolean>(false);
  const [resetDialog, setResetDialog] = useState<boolean>(false);

  const [mode, setMode] = useState<'gp' | 'scoring'>(
    scoresheet.status === 'waiting-for-gp' ? 'gp' : 'scoring'
  );

  useEffect(() => {
    if (scoresheet.status === 'waiting-for-gp') {
      setMode('gp');
    } else {
      setMode('scoring');
    }
  }, [scoresheet.status]);

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
      } catch (error) {
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

  const handleSync = (
    showSnackbar: boolean,
    formValues: FormikValues | undefined,
    newStatus: ScoresheetStatus | undefined,
    saveSignature = false,
    escalate?: boolean
  ) => {
    const updatedScoresheet = {} as Partial<Scoresheet>;
    if (newStatus) updatedScoresheet.status = newStatus;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (formValues) (updatedScoresheet as any).data = formValues;
    if (saveSignature && signatureRef.current && updatedScoresheet.data)
      updatedScoresheet.data.signature = signatureRef.current.getCanvas().toDataURL('image/png');
    if (escalate !== undefined) updatedScoresheet.escalated = escalate;

    return new Promise<void>((resolve, reject) => {
      socket.emit(
        'updateScoresheet',
        division._id.toString(),
        team._id.toString(),
        scoresheet._id.toString(),
        updatedScoresheet,
        (response: { ok: boolean }) => {
          if (response.ok) {
            if (showSnackbar) {
              enqueueSnackbar(
                updatedScoresheet.data?.gp
                  ? 'דירוג המקצועיות האדיבה נשמר בהצלחה.'
                  : 'דף הניקוד נשמר בהצלחה.',
                { variant: 'success' }
              );
            }
            resolve();
          } else {
            enqueueSnackbar('אופס, שמירת דף הניקוד נכשלה.', { variant: 'error' });
            reject(new Error('Scoresheet update failed'));
          }
        }
      );
    });
  };

  const validateScoresheet = (formValues: FormikValues) => {
    const errors: Record<string, string> = {};
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
        newMissionInfo[index].errors?.push(e);
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
      } catch (error) {
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
                  <ScoresheetSignature
                    canvasRef={signatureRef}
                    signature={values.signature}
                    allowEdit={
                      !readOnly &&
                      validatorErrors.length === 0 &&
                      missionInfo.every(mi => !mi.incomplete && !mi.errors) &&
                      (!values.signature || values.signature.length === 0)
                    }
                    allowReset={!['ready', 'waiting-for-gp'].includes(scoresheet.status)}
                    onUpdate={() => validateForm()}
                  />

                  {!isValid && (
                    <ScoresheetAlert
                      severity="warning"
                      onClick={e => {
                        e.preventDefault();
                        const invalidMission = missionInfo.find(mi => mi.incomplete || mi.errors);
                        if (invalidMission) window.location.href = `#${invalidMission.id}`;
                      }}
                      text={
                        Object.keys(errors).length === 1 && !!errors.signature
                          ? 'הקבוצה טרם חתמה על דף הניקוד.'
                          : 'דף הניקוד אינו מלא.'
                      }
                    />
                  )}

                  {validatorErrors.map((e: ErrorWithMessage) => (
                    <ScoresheetAlert key={e.id} text={e.description} severity="error" />
                  ))}

                  <Stack direction="row" spacing={2}>
                    <RoleAuthorizer user={user} allowedRoles={['referee']}>
                      <Button
                        variant="contained"
                        sx={{ minWidth: 200 }}
                        endIcon={<SportsScoreIcon />}
                        onClick={() => setHeadRefDialog(true)}
                      >
                        העברת דף הניקוד לשופט ראשי
                      </Button>
                    </RoleAuthorizer>

                    <RoleAuthorizer user={user} allowedRoles={['head-referee']}>
                      {scoresheet.status !== 'ready' && !scoresheet.escalated && (
                        <Button
                          variant="contained"
                          sx={{ minWidth: 150 }}
                          endIcon={<SportsScoreIcon />}
                          onClick={() => setHeadRefDialog(true)}
                        >
                          העברת דף הניקוד לאחריותך
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        sx={{ minWidth: 150 }}
                        disabled={scoresheet.status === 'empty'}
                        onClick={() => setResetDialog(true)}
                      >
                        איפוס דף הניקוד
                      </Button>
                    </RoleAuthorizer>

                    <Button
                      variant="contained"
                      sx={{ minWidth: 150 }}
                      endIcon={<ChevronLeftIcon />}
                      disabled={!isValid}
                      onClick={() => {
                        if (scoresheet.status === 'ready' || readOnly) {
                          setMode('gp');
                          return;
                        }
                        handleSync(true, values, 'waiting-for-gp', true);
                      }}
                    >
                      המשך
                    </Button>
                  </Stack>

                  <Dialog open={headRefDialog} onClose={() => setHeadRefDialog(false)}>
                    <DialogTitle>העברת דף הניקוד לשופט הראשי</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        העברת דף הניקוד לשופט זירה ראשי תנעל את דף הניקוד ותעביר את השולחן למקצה
                        הבא. שופטי הזירה לא יכולו להמשיך את תהליך הניקוד עם הקבוצה. האם אתם בטוחים?
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setHeadRefDialog(false)} autoFocus>
                        ביטול
                      </Button>
                      <Button
                        onClick={() => {
                          handleSync(true, values, undefined, false, true);
                          setHeadRefDialog(false);
                        }}
                      >
                        אישור
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
                    <DialogTitle>איפוס דף הניקוד</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
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
                </Stack>
              </>
            ) : (
              <GpSelector
                user={user}
                scoresheetStatus={scoresheet.status}
                onBack={() => {
                  if (scoresheet.status === 'ready' || readOnly) {
                    setMode('scoring');
                    return;
                  }
                  handleSync(false, values, 'completed');
                }}
                onSubmit={() => {
                  handleSync(true, values, 'ready', false, false).then(() =>
                    router.push(`/lems/${user.role}`)
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
