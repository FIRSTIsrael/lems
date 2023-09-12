import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface BooleanIconProps {
  condition: boolean;
}

const BooleanIcon: React.FC<BooleanIconProps> = ({ condition }) => {
  return condition ? (
    <CheckRoundedIcon sx={{ color: '#138a17' }} />
  ) : (
    <CloseRoundedIcon color="error" />
  );
};

export default BooleanIcon;
