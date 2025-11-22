import { Box, BoxProps, Breakpoint } from '@mui/material';

interface ResponsiveComponentProps extends BoxProps {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  mobileBreakpoint?: Breakpoint;
}

export const ResponsiveComponent = ({
  desktop,
  mobile,
  mobileBreakpoint = 'md',
  ...boxProps
}: ResponsiveComponentProps) => {
  return (
    <>
      <Box display={{ xs: 'block', [mobileBreakpoint]: 'none' }} {...boxProps}>
        {mobile}
      </Box>
      <Box display={{ xs: 'none', [mobileBreakpoint]: 'block' }} {...boxProps}>
        {desktop}
      </Box>
    </>
  );
};
