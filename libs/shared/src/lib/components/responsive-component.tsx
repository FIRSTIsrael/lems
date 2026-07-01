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
      <Box
        {...boxProps}
        sx={[{
          display: { xs: 'block', [mobileBreakpoint]: 'none' }
        }, ...(Array.isArray(boxProps.sx) ? boxProps.sx : [boxProps.sx])]}>
        {mobile}
      </Box>
      <Box
        {...boxProps}
        sx={[{
          display: { xs: 'none', [mobileBreakpoint]: 'block' }
        }, ...(Array.isArray(boxProps.sx) ? boxProps.sx : [boxProps.sx])]}>
        {desktop}
      </Box>
    </>
  );
};
