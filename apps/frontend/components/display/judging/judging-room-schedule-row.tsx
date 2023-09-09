import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import PageIcon from '@mui/icons-material/DescriptionOutlined';
import { JudgingSession, JudgingRoom, Team, SafeUser, JudgingCategoryTypes } from '@lems/types';
import EditRubricButton from '../../input/edit-rubric-button';
import StartJudgingSessionButton from '../../input/start-judging-session-button';
import { RoleAuthorizer } from '../../role-authorizer';
import { localizeJudgingCategory } from '../../../lib/utils/localization';

interface Props {
  room: JudgingRoom;
  session: WithId<JudgingSession>;
  team: Team;
  user: SafeUser;
}

const JudgingRoomScheduleRow = ({ room, session, team, user }: Props) => {
  return (
    <TableRow
      key={room.name + session.time}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell component="th" scope="row" align="center">
        {dayjs(session.time).format('HH:mm')}
      </TableCell>
      <TableCell align="right">
        <Tooltip title={`${team.affiliation.institution}, ${team.affiliation.city}`} arrow>
          <span>#{team.number}</span>
        </Tooltip>
      </TableCell>
      <RoleAuthorizer user={user} allowedRoles="judge">
        <TableCell align="center">
          <StartJudgingSessionButton session={session} />
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
              allowedRoles={['judge', 'lead-judge']}
              conditionalRoles={'judge-advisor'}
              conditions={{ roleAssociation: { type: 'category', value: judgingCategory } }}
            >
              <EditRubricButton
                href={`/event/${user.event}/team/${team.number}/rubrics/${judgingCategory}`}
                status={'empty'} //TODO: Crud from rubrics for status
              >
                {localizeJudgingCategory(judgingCategory).name}
              </EditRubricButton>
            </RoleAuthorizer>
          );
        })}
      </TableCell>
    </TableRow>
  );
};

export default JudgingRoomScheduleRow;
