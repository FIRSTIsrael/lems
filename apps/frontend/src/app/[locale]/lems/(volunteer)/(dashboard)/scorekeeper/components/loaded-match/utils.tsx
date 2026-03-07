import {
  CheckCircle,
  Block,
  HourglassEmpty,
  PersonPin,
  WarningAmber,
  HelpOutline,
  HorizontalRuleRounded
} from '@mui/icons-material';
import { Match } from '../../graphql';

export type TeamReadinessStatus =
  | 'ready'
  | 'present'
  | 'queued'
  | 'no-show'
  | 'conflict'
  | 'missing'
  | 'empty';

export const getStatusIcon = (status: TeamReadinessStatus) => {
  const iconProps = { sx: { fontSize: '1.5rem' } };

  switch (status) {
    case 'ready':
      return <CheckCircle {...iconProps} color="success" />;
    case 'present':
      return <PersonPin {...iconProps} sx={{ ...iconProps.sx, color: 'warning.main' }} />;
    case 'queued':
      return <HourglassEmpty {...iconProps} color="info" />;
    case 'no-show':
      return <Block {...iconProps} sx={{ ...iconProps.sx, color: 'error.main' }} />;
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
