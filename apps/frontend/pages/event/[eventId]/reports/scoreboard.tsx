import { Event, EventState, RoleTypes, SafeUser, Scoresheet, Team } from '@lems/types';
import RemoveIcon from '@mui/icons-material/Remove';
import { Paper, Table, TableBody, TableBodyProps, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
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
  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, []);

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

  useWebsocket(event._id.toString(), ['field', 'audience-display'], undefined, [
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

  const maxScores = teams
    .map(t => {
      return {
        team: t,
        score: Math.max(
          ...scoresheets
            .filter(s => s.teamId === t._id && s.stage === eventState.currentStage)
            .map(s => s.data?.score || 0)
        )
      };
    })
    .sort((a, b) => b.score - a.score);

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
        maxWidth="xl"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - טבלת ניקוד | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/reports`}
        backDisabled={connectionStatus === 'connecting'}
      >
        <TableContainer
          component={Paper}
          sx={{
            fontWeight: 700,
            mt: 4,
          }}
        >
          <Table
            stickyHeader
            sx={{
              '.MuiTableRow-root:nth-child(odd)': { backgroundColor: '#f9f9f9' }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ font: 'inherit', textAlign: 'center' }}>דירוג</TableCell>
                <TableCell sx={{ font: 'inherit' }}>קבוצה</TableCell>
                {rounds.map(r => (
                  <TableCell key={r.stage + r.round + 'name'} align="center" sx={{ font: 'inherit' }}>
                    {localizedMatchStage[r.stage]} #{r.round}
                  </TableCell>
                ))}
                {eventState.currentStage !== 'practice' && (
                  <TableCell align="center" sx={{ font: 'inherit' }}>
                    ניקוד גבוה ביותר
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <ScoreboardScoresBody
              scoresheets={scoresheets}
              rounds={rounds}
              currentStage={eventState.currentStage}
              maxScores={maxScores}
            />
          </Table>
        </TableContainer>
      </Layout>
    </RoleAuthorizer>
  );
};

interface ScoreboardScoresBodyProps extends TableBodyProps {
  scoresheets: Array<WithId<Scoresheet>>;
  rounds: Array<{ stage: string; round: number }>;
  currentStage: 'practice' | 'ranking';
  maxScores: Array<{ team: WithId<Team>; score: number }>;
}

const ScoreboardScoresBody: React.FC<ScoreboardScoresBodyProps> = ({
  scoresheets,
  rounds,
  currentStage,
  maxScores,
  ...props
}) => {
  return (
    <TableBody {...props}>
      {maxScores.map(({ team, score: maxScore }, index) => {
        return (
          <TableRow key={team._id.toString()}>
            <TableCell sx={{ font: 'inherit', textAlign: 'center' }}>
              {index + 1}
            </TableCell>
            <TableCell
              sx={{
                font: 'inherit',
                color: !team.registered ? '#aaa' : undefined
              }}
            >
              {localizeTeam(team, false)}
            </TableCell>
            {rounds.map(r => {
              const scoresheet = scoresheets.find(
                s => s.teamId === team._id && s.stage === r.stage && s.round === r.round
              );
              return (
                <TableCell
                  key={r.stage + r.round + 'points'}
                  align="center"
                  sx={{ font: 'inherit', fontWeight: 400 }}
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
              <TableCell align="center" sx={{ font: 'inherit' }}>
                {maxScore || <RemoveIcon />}
              </TableCell>
            )}
          </TableRow>
        );
      })}
      {/* Separator */}
      <TableRow sx={{ height: '4.5rem' }}>
        <TableCell colSpan={(currentStage === 'practice' ? 2 : 3) + rounds.length} />
      </TableRow>
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
