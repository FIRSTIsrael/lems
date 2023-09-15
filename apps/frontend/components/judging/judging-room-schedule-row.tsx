import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import PageIcon from '@mui/icons-material/DescriptionOutlined';
import { Socket } from 'socket.io-client';
import {
  Event,
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
import { RoleAuthorizer } from '../role-authorizer';
import { localizedJudgingCategory } from '../../localization/judging';
import StatusIcon from '../general/status-icon';

interface Props {
  event: WithId<Event>;
  room: WithId<JudgingRoom>;
  session: WithId<JudgingSession>;
  team: WithId<Team>;
  user: WithId<SafeUser>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const JudgingRoomScheduleRow = ({ event, room, session, team, user, rubrics, socket }: Props) => {
  return (
    <TableRow
      key={room.name + session.time}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell component="th" scope="row" align="center">
        {dayjs(session.time).format('HH:mm')}
      </TableCell>
      <TableCell align="left">
        <Tooltip
          title={
            team.registered
              ? `${team.name}, ${team.affiliation.institution}, ${team.affiliation.city}`
              : 'הקבוצה טרם הגיעה לאירוע'
          }
          arrow
        >
          <span style={{ color: !team.registered ? '#f57c00' : '' }}>#{team.number}</span>
        </Tooltip>
      </TableCell>
      <RoleAuthorizer user={user} allowedRoles="judge">
        <TableCell align="center">
          <StartJudgingSessionButton
            event={event}
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
          title={team.profileDocument ? 'צפייה בדף המידע הקבוצתי' : 'לא הועלה דף מידע קבוצתי'}
          arrow
        >
          <span>
            <IconButton
              href={team.profileDocument ? team.profileDocument.link : ''}
              target="_blank"
              disabled={!team.profileDocument}
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
                href={`/event/${user.event}/team/${team._id}/rubrics/${judgingCategory}`}
                status={
                  rubrics.find(
                    rubric => rubric.category === judgingCategory && rubric.team === team._id
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
