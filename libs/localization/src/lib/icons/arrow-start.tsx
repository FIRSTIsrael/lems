import { SvgIconProps, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';

export const ArrowStartIcon: React.FC<SvgIconProps> = props => {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  return isRtl ? <ArrowForwardIcon {...props} /> : <ArrowBackIcon {...props} />;
};
