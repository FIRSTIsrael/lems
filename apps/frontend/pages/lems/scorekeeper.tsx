import { useState, useMemo, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { Paper, Tabs, Tab, Stack } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import {
  SafeUser,
  RobotGameMatch,
  DivisionState,
  MATCH_AUTOLOAD_THRESHOLD,
  DivisionWithEvent
} from '@lems/types';
import { RoleAuthorizer } from '../../components/role-authorizer';
import Layout from '../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import { useWebsocket } from '../../hooks/use-websocket';
import { useTime } from '../../hooks/use-time';
import { localizedRoles } from '../../localization/roles';
import { enqueueSnackbar } from 'notistack';
import FieldControl from '../../components/field/scorekeeper/field-control';
import VideoSwitch from '../../components/field/scorekeeper/video-switch';
import PresentationController from '../../components/field/scorekeeper/presentation-controller';
import AwardsPresentation from '../../components/presentations/awards-presentation';
import MessageEditor from '../../components/field/scorekeeper/message-editor';
import ScoreboardConfigurator from '../../components/field/scorekeeper/scoreboard-configurator';
import AwardsPresentationConfigurator from '../../components/field/scorekeeper/awards-presentation-configurator';
import { localizeDivisionTitle } from '../../localization/event';
import { useQueryParam } from '../../hooks/use-query-param';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [activeTab, setActiveTab] = useQueryParam('tab', '1');

  const currentTime = useTime({ interval: 1000 });

  const nextMatch = useMemo<WithId<RobotGameMatch> | undefined>(
    () => matches?.find(match => match.status === 'not-started' && match.stage !== 'test'),
    [matches]
  );

  useEffect(() => {
    if (
      divisionState.loadedMatch === null &&
      !matches.some(m => m.stage === 'test' && m.status === 'in-progress')
    ) {
      if (
        nextMatch?.stage === divisionState.currentStage &&
        nextMatch?.scheduledTime &&
        dayjs(nextMatch.scheduledTime).isBefore(
          currentTime.add(MATCH_AUTOLOAD_THRESHOLD, 'minutes')
        )
      )
        socket.emit('loadMatch', division._id.toString(), nextMatch._id.toString(), response => {
          if (!response.ok) enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextMatch]);

  const handleMatchEvent = (
    match: WithId<RobotGameMatch>,
    newDivisionState?: WithId<DivisionState>
  ) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (newDivisionState) setDivisionState(newDivisionState);
  };

  const handleMatchAborted = (
    newMatch: WithId<RobotGameMatch>,
    newDivisionState: WithId<DivisionState>
  ) => {
    handleMatchEvent(newMatch, newDivisionState);
    if (newMatch.stage !== 'test') {
      socket.emit('loadMatch', division._id.toString(), newMatch._id.toString(), response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
        }
      });
    }
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['field', 'audience-display'],
    undefined,
    [
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchAborted },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent },
      { name: 'audienceDisplayUpdated', handler: setDivisionState },
      { name: 'presentationUpdated', handler: setDivisionState }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="scorekeeper"
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        color={division.color}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label="מגרש" value="1" />
              <Tab label="תצוגת קהל" value="2" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <FieldControl
              division={division}
              divisionState={divisionState}
              matches={matches}
              nextMatchId={nextMatch?._id}
              socket={socket}
            />
          </TabPanel>
          <TabPanel value="2">
            <Stack alignItems="center">
              <VideoSwitch divisionState={divisionState} socket={socket} />
              {divisionState.audienceDisplay.screen === 'awards' && (
                <>
                  {divisionState.presentations['awards'].enabled && (
                    <PresentationController
                      division={division}
                      socket={socket}
                      presentationId="awards"
                      divisionState={divisionState}
                    >
                      <AwardsPresentation
                        division={division}
                        height={108 * 2.5}
                        width={192 * 2.5}
                        position="relative"
                        awardWinnerSlideStyle={
                          divisionState.audienceDisplay.awardsPresentation.awardWinnerSlideStyle
                        }
                      />
                    </PresentationController>
                  )}
                  <AwardsPresentationConfigurator divisionState={divisionState} socket={socket} />
                </>
              )}
              {divisionState.audienceDisplay.screen === 'message' && (
                <MessageEditor divisionState={divisionState} socket={socket} />
              )}
              {divisionState.audienceDisplay.screen === 'scores' && (
                <ScoreboardConfigurator divisionState={divisionState} socket={socket} />
              )}
            </Stack>
          </TabPanel>
        </TabContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        divisionState: `/api/divisions/${divisionId}/state`,
        matches: `/api/divisions/${divisionId}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
