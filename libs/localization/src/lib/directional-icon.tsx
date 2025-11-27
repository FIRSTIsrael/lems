'use client';

import { SvgIconProps, useTheme } from '@mui/material';
import { ElementType } from 'react';

interface DirectionalIconProps extends SvgIconProps {
  ltr: ElementType;

  /**
   * Optional icon to use for RTL layouts.
   * If not provided, the LTR icon will be used with a horizontal flip.
   */
  rtl?: ElementType;
}

export const DirectionalIcon: React.FC<DirectionalIconProps> = ({
  ltr: LtrIcon,
  rtl: RtlIcon,
  ...props
}) => {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  const IconComponent = isRtl ? (RtlIcon ?? LtrIcon) : LtrIcon;

  return (
    <IconComponent
      {...props}
      style={{ transform: !RtlIcon && isRtl ? 'rotateY(180deg)' : 'none' }}
    />
  );
};
