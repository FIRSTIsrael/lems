import {
  CheckCircle,
  Block,
  AccessTime,
  WarningAmber,
  HelpOutline,
  HorizontalRuleRounded
} from '@mui/icons-material';
import { Match } from '../../scorekeeper.graphql';

export type TeamReadinessStatus = 'ready' | 'no-show' | 'queued' | 'conflict' | 'missing' | 'empty';

export const getStatusIcon = (status: TeamReadinessStatus) => {
  const iconProps = { sx: { fontSize: '1.2rem' } };

  switch (status) {
    case 'ready':
      return <CheckCircle {...iconProps} color="success" />;
    case 'no-show':
      return <Block {...iconProps} sx={{ ...iconProps.sx, color: 'error.main' }} />;
    case 'queued':
      return <AccessTime {...iconProps} color="info" />;
    case 'conflict':
      return <WarningAmber {...iconProps} sx={{ ...iconProps.sx, color: 'warning.main' }} />;
    case 'missing':
      return <HelpOutline {...iconProps} color="disabled" />;
    case 'empty':
      return <HorizontalRuleRounded {...iconProps} color="disabled" />;
    default:
      return null;
  }
};

export const getTeamLabel = (participant: Match['participants'][number]) => {
  if (!participant.team) return '';
  return `#${participant.team.number} · ${participant.team.name}`;
};
