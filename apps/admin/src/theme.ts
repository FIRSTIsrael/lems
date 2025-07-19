'use client';
import { createTheme } from '@mui/material/styles';

/**
 * Integrate with Next.js' font optimization
 * See: https://mui.com/material-ui/integrations/nextjs/#font-optimization
 */
const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-heebo),var(--font-roboto)'
  }
});

export default theme;
