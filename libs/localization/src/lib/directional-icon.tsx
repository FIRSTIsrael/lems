'use client';

import { SvgIconProps, useTheme } from '@mui/material';
import { ElementType } from 'react';

interface DirectionalIconProps extends SvgIconProps {
  ltr: ElementType;
  rtl: ElementType;
}

export const DirectionalIcon: React.FC<DirectionalIconProps> = ({
  ltr: LtrIcon,
  rtl: RtlIcon,
  ...props
}) => {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  const IconComponent = isRtl ? RtlIcon : LtrIcon;

  return <IconComponent {...props} />;
};
