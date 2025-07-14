import { SvgIconProps, SxProps, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface DirectionalIconProps extends SvgIconProps {
  sxProps?: SxProps;
}

export const ChevronStartIcon: React.FC<DirectionalIconProps> = ({ sxProps, ...props }) => {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  return isRtl ? (
    <ChevronRightIcon {...props} sx={{ ...sxProps, color: 'rgba(0, 0, 0, 0.54)' }} />
  ) : (
    <ChevronLeftIcon {...props} sx={{ ...sxProps, color: 'rgba(0, 0, 0, 0.54)' }} />
  );
};