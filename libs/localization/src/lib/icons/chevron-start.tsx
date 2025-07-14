import { SvgIconProps, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const ChevronStartIcon: React.FC<SvgIconProps> = props => {
  const { sx, ...rest } = props;
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  return isRtl ? (
    <ChevronRightIcon {...rest} sx={{ ...sx, color: 'rgba(0, 0, 0, 0.54)' }} />
  ) : (
    <ChevronLeftIcon {...rest} sx={{ ...sx, color: 'rgba(0, 0, 0, 0.54)' }} />
  );
};
