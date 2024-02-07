import { useEffect, useState, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { WithId } from 'mongodb';
import {
  Button,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { purple } from '@mui/material/colors';
import NextLink from 'next/link';
import {
  Event,
  RobotGameMatch,
  RobotGameMatchParticipant,
  RobotGameTable,
  SafeUser,
  Scoresheet,
  Mission,
  Team,
  MissionClauseType,
  RobotGameMatchPresent
} from '@lems/types';
import Layout from '../../../../../../components/layout';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../../../components/connection-indicator';
import { apiFetch, serverSideGetRequests } from '../../../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../../../hooks/use-websocket';
import { localizeTeam } from '../../../../../../localization/teams';
import { localizedMatchStage } from '../../../../../../localization/field';
import ScoresheetForm from '../../../../../../components/field/scoresheet/scoresheet-form';

interface ScoresheetSelectorProps {
  event: WithId<Event>;
  team: WithId<Team>;
  matchScoresheet: WithId<Scoresheet>;
}

const ScoresheetSelector: React.FC<ScoresheetSelectorProps> = ({
  event,
  team,
  matchScoresheet
}) => {
  const [teamScoresheets, setTeamScoresheets] = useState<Array<WithId<Scoresheet>> | undefined>(
    undefined
  );

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/teams/${team._id}/scoresheets`)
      .then(res => res.json())
      .then((data: Array<WithId<Scoresheet>>) =>
        setTeamScoresheets(
          data.sort((a, b) =>
            a.stage === b.stage ? a.round - b.round : a.stage === 'practice' ? -1 : 1
          )
        )
      );
  }, [event._id, team._id]);

  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
      {teamScoresheets &&
        teamScoresheets.map(scoresheet => {
          return (
            <NextLink
              key={scoresheet._id.toString()}
              href={`/event/${event._id}/team/${team._id}/scoresheet/${scoresheet._id}`}
              passHref
              legacyBehavior
            >
              <Button
                variant="contained"
                color="inherit"
                sx={{
                  backgroundColor:
                    matchScoresheet._id === scoresheet._id ? purple[700] : 'transparent',
                  borderRadius: '2rem',
                  '&:hover': {
                    backgroundColor:
                      matchScoresheet._id == scoresheet._id ? purple[700] : purple[700] + '1f'
                  },
                  display: 'block',
                  textAlign: 'center',
                  minWidth: 150,
                  minHeight: 60
                }}
              >
                <Typography
                  fontSize="1rem"
                  fontWeight={500}
                  color={matchScoresheet._id === scoresheet._id ? '#fff' : purple[700]}
                  gutterBottom
                >
                  מקצה {localizedMatchStage[scoresheet.stage]} #{scoresheet.round}
                </Typography>
                {scoresheet.data && (
                  <Typography
                    fontSize="0.75rem"
                    fontWeight={500}
                    color={matchScoresheet._id === scoresheet._id ? '#fff' : purple[700]}
                  >
                    {scoresheet.data.score} נק&apos;,{' '}
                    {scoresheet.data.gp?.value && `GP - ${scoresheet.data.gp.value}`}
                  </Typography>
                )}
              </Button>
            </NextLink>
          );
        })}
    </Stack>
  );
};

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  team: WithId<Team>;
  table: WithId<RobotGameTable>;
  match: WithId<RobotGameMatch>;
  scoresheet: WithId<Scoresheet>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  team,
  table,
  match,
  scoresheet: initialScoresheet
}) => {
  const router = useRouter();
  const [scoresheet, setScoresheet] = useState<WithId<Scoresheet> | undefined>(initialScoresheet);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(
    user.role === 'head-referee' &&
      match.status === 'completed' &&
      match.participants.find(p => p.teamId === team._id)?.present === 'no-show'
  );

  if (!team.registered) {
    router.push(`/event/${event._id}/${user.role}`);
    enqueueSnackbar('הקבוצה טרם הגיעה לאירוע.', { variant: 'info' });
  }
  if (match.status === 'not-started') {
    router.push(`/event/${event._id}/${user.role}`);
    enqueueSnackbar('המקצה טרם התחיל.', { variant: 'info' });
  }
  if (match.participants.find(p => p.teamId === team._id)?.present === 'no-show') {
    if (user.role !== 'head-referee' || match.status !== 'completed') {
      router.push(`/event/${event._id}/${user.role}`);
      enqueueSnackbar('הקבוצה לא נכחה במקצה.', { variant: 'info' });
    }
  }

  if (scoresheet?.status === 'waiting-for-head-ref' && user.role !== 'head-referee')
    router.push(`/event/${event._id}/${user.role}`);

  const { socket, connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    {
      name: 'scoresheetUpdated',
      handler: scoresheet => {
        if (scoresheet._id === router.query.scoresheetId) setScoresheet(scoresheet);
      }
    }
  ]);

  const getScoresheetOverrides = () => {
    const values: Array<Mission> = [];
    if (router.query.inspection) {
      const inspection = {
        id: 'eib',
        clauses: [
          {
            type: 'boolean' as MissionClauseType,
            value: router.query.inspection === 'true'
          }
        ]
      };
      values.push(inspection);
    }
    return values;
  };

  const updateTeamPresentStatus = useCallback(
    (presentStatus: RobotGameMatchPresent) => {
      socket.emit(
        'prestartMatchParticipant',
        match.eventId.toString(),
        match._id.toString(),
        {
          teamId: team._id.toString(),
          present: presentStatus
        },
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון סטטוס הקבוצה נכשל.', { variant: 'error' });
          }
        }
      );
    },
    [socket, match.eventId, match._id, team._id]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={
        scoresheet?.status === 'waiting-for-head-ref'
          ? ['head-referee']
          : ['referee', 'head-referee']
      }
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      {team && (
        <Layout
          maxWidth="md"
          title={`מקצה ${localizedMatchStage[match.stage]} #${match.round} של קבוצה #${team.number}, ${
            team.name
          } | ${event.name}`}
          error={connectionStatus === 'disconnected'}
          action={<ConnectionIndicator status={connectionStatus} />}
          back={`/event/${event._id}/${user.role}`}
          backDisabled={connectionStatus === 'connecting'}
        >
          <Paper sx={{ p: 3, mt: 4, mb: 2 }}>
            <Typography variant="h2" fontSize="1.25rem" fontWeight={500} align="center">
              {localizeTeam(team)} | שולחן {table.name}
            </Typography>
          </Paper>
          <RoleAuthorizer user={user} allowedRoles={['head-referee']}>
            <ScoresheetSelector
              event={event}
              team={team}
              matchScoresheet={scoresheet as WithId<Scoresheet>}
            />
          </RoleAuthorizer>
          {scoresheet && (
            <ScoresheetForm
              event={event}
              team={team}
              scoresheet={scoresheet}
              user={user}
              socket={socket}
              emptyScoresheetValues={getScoresheetOverrides()}
            />
          )}
          <Dialog
            open={noShowDialogOpen}
            onClose={(event, reason) => {
              if (reason && reason === 'backdropClick') return;
              setNoShowDialogOpen(false);
            }}
            aria-labelledby="update-present-title"
            aria-describedby="update-present-description"
          >
            <DialogTitle id="update-present-title">רגע!</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-data-description">
                {`שופט הזירה סימן שהקבוצה לא נכחה במקצה. 
                האם אתם בטוחים שברצונכם לתת ניקוד לקבוצה ${localizeTeam(team)} 
                ניקוד על מקצה ${
                  scoresheet && localizedMatchStage[scoresheet.stage]
                } #${scoresheet?.round}?`}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => router.push(`/event/${event._id}/${user.role}`)}
              >
                ביטול
              </Button>
              <Button
                onClick={e => {
                  e.preventDefault();
                  updateTeamPresentStatus('present');
                  setNoShowDialogOpen(false);
                }}
              >
                אישור
              </Button>
            </DialogActions>
          </Dialog>
        </Layout>
      )}
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        scoresheet: `/api/events/${user.eventId}/scoresheets/${ctx.params?.scoresheetId}`
      },
      ctx
    );

    const matches = await apiFetch(`/api/events/${user.eventId}/matches`, undefined, ctx).then(
      res => res?.json()
    );
    const match = matches.find(
      (m: RobotGameMatch) =>
        m.participants
          .filter(p => p.teamId)
          .find(p => p.teamId?.toString() === ctx.params?.teamId) &&
        m.stage === data.scoresheet.stage &&
        m.round === data.scoresheet.round
    );

    const team = match.participants
      .filter((p: RobotGameMatchParticipant) => p.teamId)
      .find((p: RobotGameMatchParticipant) => p.teamId?.toString() === ctx.params?.teamId)?.team;

    let tableId;

    if (user.roleAssociation && user.roleAssociation.type === 'table') {
      tableId = user.roleAssociation.value;
    } else {
      tableId = match.participants
        .filter((p: RobotGameMatchParticipant) => p.teamId)
        .find(
          (p: RobotGameMatchParticipant) => p.teamId?.toString() === ctx.params?.teamId
        )?.tableId;
    }

    const table = await apiFetch(
      `/api/events/${user.eventId}/tables/${tableId}`,
      undefined,
      ctx
    ).then(res => res.json());

    return { props: { user, match, team, table, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
