import { createTheme, Shadows } from '@mui/material/styles';
import { Locales, Locale } from '@lems/localization';

const softShadows: Shadows = [
  'none',
  '0px 1px 2px 0px rgb(0 0 0 / 3%), 0px 2px 10px 0px rgb(0 0 0 / 12%)',
  '0 6px 12px 0 rgb(0 0 0 / 8%), 0 0 0 1px rgb(0 0 0 / 6%)',
  '0 6px 8px 0 rgb(0 0 0 / 12%), 0 0 0 1px rgb(0 0 0 / 6%)',
  '0 8px 12px 0 rgb(0 0 0 / 12%), 0 0 0 1px rgb(0 0 0 / 6%)',
  '0 10px 16px 0 rgb(0 0 0 / 10%), 0 2px 4px 0 rgb(0 0 0 / 6%)',
  '0 12px 20px 0 rgb(0 0 0 / 10%), 0 4px 8px 0 rgb(0 0 0 / 6%)',
  '0 14px 24px 0 rgb(0 0 0 / 10%), 0 6px 12px 0 rgb(0 0 0 / 6%)',
  '0 16px 28px 0 rgb(0 0 0 / 11%), 0 8px 16px 0 rgb(0 0 0 / 6%)',
  '0 18px 32px 0 rgb(0 0 0 / 11%), 0 10px 20px 0 rgb(0 0 0 / 6%)',
  '0 20px 36px 0 rgb(0 0 0 / 12%), 0 12px 24px 0 rgb(0 0 0 / 7%)',
  '0 22px 40px 0 rgb(0 0 0 / 12%), 0 14px 28px 0 rgb(0 0 0 / 7%)',
  '0 24px 44px 0 rgb(0 0 0 / 13%), 0 16px 32px 0 rgb(0 0 0 / 7%)',
  '0 26px 48px 0 rgb(0 0 0 / 13%), 0 18px 36px 0 rgb(0 0 0 / 7%)',
  '0 28px 52px 0 rgb(0 0 0 / 14%), 0 20px 40px 0 rgb(0 0 0 / 8%)',
  '0 30px 56px 0 rgb(0 0 0 / 14%), 0 22px 44px 0 rgb(0 0 0 / 8%)',
  '0 32px 60px 0 rgb(0 0 0 / 15%), 0 24px 48px 0 rgb(0 0 0 / 8%)',
  '0 34px 64px 0 rgb(0 0 0 / 15%), 0 26px 52px 0 rgb(0 0 0 / 8%)',
  '0 36px 68px 0 rgb(0 0 0 / 16%), 0 28px 56px 0 rgb(0 0 0 / 9%)',
  '0 38px 72px 0 rgb(0 0 0 / 16%), 0 30px 60px 0 rgb(0 0 0 / 9%)',
  '0 40px 76px 0 rgb(0 0 0 / 17%), 0 32px 64px 0 rgb(0 0 0 / 9%)',
  '0 42px 80px 0 rgb(0 0 0 / 17%), 0 34px 68px 0 rgb(0 0 0 / 9%)',
  '0 44px 84px 0 rgb(0 0 0 / 18%), 0 36px 72px 0 rgb(0 0 0 / 10%)',
  '0 46px 88px 0 rgb(0 0 0 / 18%), 0 38px 76px 0 rgb(0 0 0 / 10%)',
  '0 48px 92px 0 rgb(0 0 0 / 19%), 0 40px 80px 0 rgb(0 0 0 / 10%)'
];

export const baseTheme = createTheme({
  shape: {
    borderRadius: 8
  },
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
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '1rem'
        }
      }
    }
  },
  shadows: softShadows
});

export const getLocalizedTheme = (locale: Locale = 'he') => {
  const { direction, muiLocale, xDataGridLocale } = Locales[locale];
  return createTheme(baseTheme, { direction }, muiLocale, xDataGridLocale);
};
