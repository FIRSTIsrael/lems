import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import LEMSLocales, { Locales } from '../locale/locales';

const mainColor = '#0071e3';
const fourthShadow = '0 8px 12px 0 rgb(0 0 0 / 8%), 0 0 0 1px rgb(0 0 0 / 4%)';

export const baseTheme = createTheme({
  shape: {
    borderRadius: 8
  },
  palette: {
    primary: {
      main: mainColor
    },
    secondary: {
      main: '#19857b'
    },
    error: {
      main: red.A400
    },
    background: {
      default: '#f5f5f7'
    },
    divider: 'rgba(0, 0, 0, 0.08)'
  },
  shadows: [
    'none',
    '0px 1px 2px 0px rgb(0 0 0 / 1%), 0px 2px 10px 0px rgb(0 0 0 / 8%)',
    '0 6px 12px 0 rgb(0 0 0 / 4%), 0 0 0 1px rgb(0 0 0 / 4%)',
    '0 6px 8px 0 rgb(0 0 0 / 8%), 0 0 0 1px rgb(0 0 0 / 4%)',
    '0 8px 12px 0 rgb(0 0 0 / 8%), 0 0 0 1px rgb(0 0 0 / 4%)',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none'
  ],
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
  mixins: {
    toolbar: {
      minHeight: '3.5rem'
    }
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableTouchRipple: true
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        sizeLarge: {
          padding: '1rem 1.25rem',
          fontSize: '1rem',
          letterSpacing: '0.00938em',
          lineHeight: 21 / 16,
          fontWeight: 700
        },
        containedPrimary: {
          backgroundColor: mainColor,
          color: '#fff'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '1rem'
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          textAlign: 'start'
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        list: {
          padding: '0.75rem !important'
        },
        paper: {
          boxShadow: `${fourthShadow} !important`
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: '#000',
          background: '#fff',
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 8%), 0 0 0 1px rgb(0 0 0 / 4%)'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          transform: 'rotateY(180deg)'
        }
      }
    }
  }
});

export const getLocalizedTheme = (locale: Locales = 'he') => {
  const { direction, muiLocale, xDataGridLocale } = LEMSLocales[locale];
  return createTheme(baseTheme, { direction }, muiLocale, xDataGridLocale);
};
