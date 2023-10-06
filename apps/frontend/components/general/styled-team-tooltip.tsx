import { WithId } from 'mongodb';
import { Tooltip } from '@mui/material';
import { Team } from '@lems/types';
import { localizeTeam } from '../../localization/teams';

interface StyledTeamTooltipProps {
  team: WithId<Team>;
}

const StyledTeamTooltip: React.FC<StyledTeamTooltipProps> = ({ team }) => {
  return (
    <Tooltip title={team.registered ? localizeTeam(team) : 'הקבוצה טרם הגיעה לאירוע'} arrow>
      <span style={{ color: !team.registered ? '#f57c00' : '' }}>#{team.number}</span>
    </Tooltip>
  );
};

export default StyledTeamTooltip;
