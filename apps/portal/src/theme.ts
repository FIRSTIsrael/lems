import { createTheme } from '@mui/material/styles';
import { Locales, Locale } from '@lems/localization';

export const defaultColor = '#003d6a';

export const baseTheme = createTheme({
  palette: {
    primary: {
      main: defaultColor,
      dark: '#002a4d' 
    },
    secondary: {
      main: '#fafafa'
    }
  },
  typography: {
    fontFamily: 'var(--font-heebo),var(--font-roboto)',
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

export const getLocalizedTheme = (locale: Locale = 'he') => {
  const { direction, muiLocale, xDataGridLocale, xDatePickersLocale } = Locales[locale];
  return createTheme(baseTheme, { direction }, muiLocale, xDataGridLocale, xDatePickersLocale);
};
