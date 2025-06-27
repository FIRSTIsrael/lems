import { createTheme } from '@mui/material/styles';
import PortalLocales, { Locales } from '../locale/locales';

export const baseTheme = createTheme({
  palette: {
    primary: {
      main: '#003d6a'
    },
    secondary: {
      main: '#fafafa'
    }
  },
  typography: {
    fontFamily: [
      'Heebo',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(','),
    h1: {
      fontWeight: 800,
      fontSize: '2rem'
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    button: {
      textTransform: 'initial',
      fontWeight: 500,
      letterSpacing: 0
    }
  }
});

export const getLocalizedTheme = (locale: Locales = 'he') => {
  const { direction, muiLocale, xDataGridLocale } = PortalLocales[locale];
  return createTheme(baseTheme, { direction }, muiLocale, xDataGridLocale);
};

export default getLocalizedTheme;
