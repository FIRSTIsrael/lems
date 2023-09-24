import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import GradeIcon from '@mui/icons-material/Grade';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { ScoresheetStatus, Status } from '@lems/types';

interface ScoresheetStatusIconProps {
  status: ScoresheetStatus;
}

const ScoresheetStatusIcon: React.FC<ScoresheetStatusIconProps> = ({ status }) => {
  const icons: {
    [key in ScoresheetStatus]: JSX.Element;
  } = {
    empty: <RemoveIcon sx={{ color: '#666' }} />,
    'in-progress': <HourglassEmptyIcon sx={{ color: '#f57c00' }} />,
    completed: <CheckIcon color="primary" />,
    'waiting-for-head-ref': <SportsScoreIcon sx={{ color: '#f57c00' }} />,
    'waiting-for-gp': <CheckIcon color="primary" />,
    ready: <DoneAllIcon sx={{ color: '#388e3c' }} />
  };

  return icons[status];
};

export default ScoresheetStatusIcon;
