import { Tooltip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface BooleanIconProps {
  condition: boolean;
  tooltip?: { true: string; false: string };
}

const BooleanIcon: React.FC<BooleanIconProps> = ({ condition, tooltip }) => {
  return condition ? (
    <Tooltip title={tooltip?.true} arrow>
      <span>
        <CheckRoundedIcon sx={{ color: '#138a17' }} />
      </span>
    </Tooltip>
  ) : (
    <Tooltip title={tooltip?.false} arrow>
      <span>
        <CloseRoundedIcon color="error" />
      </span>
    </Tooltip>
  );
};

export default BooleanIcon;
