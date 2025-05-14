import { WithId } from 'mongodb';
import { Tooltip } from '@mui/material';
import { TeamRegistration } from '@lems/types';
import { localizeTeam } from '../../localization/teams';

interface StyledTeamTooltipProps {
  team: WithId<TeamRegistration>;
}

const StyledTeamTooltip: React.FC<StyledTeamTooltipProps> = ({ team }) => {
  return (
    <Tooltip title={(!team.arrived ? '🚫 ' : '') + localizeTeam(team)} arrow>
      <span style={{ color: !team.arrived ? '#f57c00' : '' }}>#{team.number}</span>
    </Tooltip>
  );
};

export default StyledTeamTooltip;
