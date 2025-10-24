import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Status } from '@lems/types';
import type { JSX } from "react";

interface StatusIconProps {
  status: Status;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  const icons: {
    [key in Status]: JSX.Element;
  } = {
    'not-started': <RemoveIcon sx={{ color: '#666' }} />,
    'in-progress': <HourglassEmptyIcon sx={{ color: '#f57c00' }} />,
    completed: <CheckIcon sx={{ color: '#388e3c' }} />
  };

  return icons[status];
};

export default StatusIcon;
