// This component uses a theme override to unflip the linear progress bar.
// See the following github issue: https://github.com/mui/material-ui/issues/28326
// Should be removed and replaced with a non-hacky method once it is resolved in MUI

import { LinearProgress, LinearProgressProps, ThemeProvider } from '@mui/material';

const FlippedLinearProgress: React.FC<LinearProgressProps> = ({ ...props }) => {
  return (
    <ThemeProvider theme={outerTheme => ({ ...outerTheme, direction: 'rtl' })}>
      <LinearProgress {...props} />
    </ThemeProvider>
  );
};

export default FlippedLinearProgress;
