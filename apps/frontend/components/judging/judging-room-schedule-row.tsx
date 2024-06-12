import { useEffect } from 'react';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import PageIcon from '@mui/icons-material/DescriptionOutlined';
import { Socket } from 'socket.io-client';
import {
  Division,
  JudgingSession,
  JudgingRoom,
  Team,
  Rubric,
  SafeUser,
  JudgingCategoryTypes,
  WSClientEmittedEvents,
  WSServerEmittedEvents,
  JudgingCategory
} from '@lems/types';
import EditRubricButton from './edit-rubric-button';
import StartJudgingSessionButton from './start-judging-session-button';
import StyledTeamTooltip from '../general/styled-team-tooltip';
import { RoleAuthorizer } from '../role-authorizer';
import { localizedJudgingCategory } from '@lems/season';
import StatusIcon from '../general/status-icon';

interface Props {
  division: WithId<Division>;
  room: WithId<JudgingRoom>;
  session: WithId<JudgingSession>;
  team: WithId<Team>;
  user: WithId<SafeUser>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const JudgingRoomScheduleRow = ({
  division,
  room,
  session,
  team,
  user,
  rubrics,
  socket
}: Props) => {
  useEffect(() => {
    const href = window.location.href;
    if (href.includes('#')) {
      const id = href.substring(href.indexOf('#') + 1);
      if (id === team.number.toString()) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TableRow
      id={team.number.toString()}
      key={room.name + session.scheduledTime}
      sx={{ '&:last-child td, &:last-child th': { border: 0 }, scrollMarginTop: 60 }}
    >
      <TableCell component="th" scope="row" align="center">
        {dayjs(session.scheduledTime).format('HH:mm')}
      </TableCell>
      <TableCell align="left">
        <StyledTeamTooltip team={team} />
      </TableCell>
      <RoleAuthorizer user={user} allowedRoles="judge">
        <TableCell align="center">
          <StartJudgingSessionButton
            division={division}
            room={room}
            session={session}
            team={team}
            socket={socket}
          />
        </TableCell>
      </RoleAuthorizer>
      <RoleAuthorizer user={user} allowedRoles={['lead-judge', 'judge-advisor']}>
        <TableCell align="center">
          <StatusIcon status={session.status} />
        </TableCell>
      </RoleAuthorizer>
      <TableCell align="center">
        <Tooltip
          title={team.profileDocumentUrl ? 'צפייה בדף המידע הקבוצתי' : 'לא הועלה דף מידע קבוצתי'}
          arrow
        >
          <span>
            <IconButton
              href={team.profileDocumentUrl ? team.profileDocumentUrl : ''}
              target="_blank"
              disabled={!team.profileDocumentUrl}
              color="primary"
            >
              <PageIcon />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
      <TableCell align="center" sx={{ py: 0 }}>
        {JudgingCategoryTypes.map(judgingCategory => {
          return (
            <RoleAuthorizer
              key={judgingCategory}
              user={user}
              allowedRoles={['judge', 'judge-advisor']}
              conditionalRoles={'lead-judge'}
              conditions={{ roleAssociation: { type: 'category', value: judgingCategory } }}
            >
              <EditRubricButton
                active={session.status === 'completed'}
                href={`/lems/team/${team._id}/rubric/${judgingCategory}`}
                status={
                  rubrics.find(
                    rubric => rubric.category === judgingCategory && rubric.teamId === team._id
                  )?.status || 'empty'
                }
              >
                {localizedJudgingCategory[judgingCategory].name}
              </EditRubricButton>
            </RoleAuthorizer>
          );
        })}
      </TableCell>
    </TableRow>
  );
};

export default JudgingRoomScheduleRow;
