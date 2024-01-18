import { useState, useMemo } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper, Table, TableBody, TableBodyProps, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { Event, EventState, RoleTypes, SafeUser, Scoresheet, Team } from '@lems/types';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedMatchStage } from '../../../../localization/field';
import { localizedRoles } from '../../../../localization/roles';
import { localizeTeam } from '../../../../localization/teams';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  eventState: EventState;
  scoresheets: Array<WithId<Scoresheet>>;
}

const Page: NextPage<Props> = ({ user, event, teams, eventState, scoresheets: initialScoresheets}) => {
  const router = useRouter();
  const [scoresheets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);

  const handleScoresheetEvent = (scoresheet: WithId<Scoresheet>) => {
    setScoresheets(scoresheets =>
      scoresheets.map(s => {
        if (s._id === scoresheet._id) {
          return scoresheet;
        }
        return s;
      })
    );
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'scoresheetUpdated', handler: handleScoresheetEvent },
  ]);


  const rounds = [
    ...scoresheets
      .filter(s => s.stage === eventState.currentStage)
      .map(s => {
        return { stage: s.stage, round: s.round };
      })
      .filter(
        (value, index, self) =>
          index === self.findIndex(r => r.round === value.round && r.stage === value.stage)
      )
  ];

  const teamsWithMaxScores = useMemo(() => {
    return teams
    .map(t => {
      return {
        team: t,
        maxScore: Math.max(
          ...scoresheets
            .filter(s => s.teamId === t._id && s.stage === eventState.currentStage)
            .map(s => s.data?.score || 0)
        )
      };
    })
    .sort((a, b) => b.maxScore - a.maxScore)
  }, [eventState.currentStage, scoresheets, teams])

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - טבלת ניקוד | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/reports`}
        backDisabled={connectionStatus === 'connecting'}
      >
        <Paper
          sx={{
            py: 4,
            px: 2,
            my: 4,
            textAlign: 'center',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>דירוג</TableCell>
                  <TableCell>קבוצה</TableCell>
                  {rounds.map(r => (
                    <TableCell key={r.stage + r.round + 'name'}>
                      {localizedMatchStage[r.stage]} #{r.round}
                    </TableCell>
                  ))}
                  {eventState.currentStage !== 'practice' && (
                    <TableCell>
                      ניקוד גבוה ביותר
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <ScoreboardReportBody
                scoresheets={scoresheets}
                rounds={rounds}
                currentStage={eventState.currentStage}
                scores={teamsWithMaxScores}
              />
            </Table>
          </TableContainer>
        </Paper>
      </Layout>
    </RoleAuthorizer>
  );
};

interface ScoreboardReportBodyProps extends TableBodyProps {
  scoresheets: Array<WithId<Scoresheet>>;
  rounds: Array<{ stage: string; round: number }>;
  currentStage: 'practice' | 'ranking';
  scores: Array<{ team: WithId<Team>; maxScore: number }>;
}

const ScoreboardReportBody: React.FC<ScoreboardReportBodyProps> = ({
  scoresheets,
  rounds,
  currentStage,
  scores,
  ...props
}) => {
  return (
    <TableBody {...props}>
      {scores.map(({ team, maxScore }, index) => {
        return (
          <TableRow key={team._id.toString()}>
            <TableCell>
              {index + 1}
            </TableCell>
            <TableCell>
              {localizeTeam(team, false)}
            </TableCell>
            {rounds.map(r => {
              const scoresheet = scoresheets.find(
                s => s.teamId === team._id && s.stage === r.stage && s.round === r.round
              );
              return (
                <TableCell
                  key={r.stage + r.round + 'points'}
                >
                  {scoresheet?.data && scoresheet.status === 'ready' ? (
                    scoresheet.data.score
                  ) : (
                    <RemoveIcon />
                  )}
                </TableCell>
              );
            })}
            {currentStage !== 'practice' && (
              <TableCell>
                {maxScore || <RemoveIcon />}
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        teams: `/api/events/${user.eventId}/teams`,
        eventState: `/api/events/${user.eventId}/state`,
        scoresheets: `/api/events/${user.eventId}/scoresheets`,
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
