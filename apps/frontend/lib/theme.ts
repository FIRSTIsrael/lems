import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

const mainColor = '#0071e3';
const fourthShadow = '0 8px 12px 0 rgb(0 0 0 / 8%), 0 0 0 1px rgb(0 0 0 / 4%)';

const theme = createTheme({
  direction: 'rtl',
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
    // black: {
    //   '02': 'hsla(0, 0%, 0%, 0.02)',
    //   '03': 'hsla(0, 0%, 0%, 0.03)',
    //   '05': 'hsla(0, 0%, 0%, 0.05)',
    //   '07': 'hsla(0, 0%, 0%, 0.07)',
    //   '10': 'hsla(0, 0%, 0%, 0.1)',
    //   '12': 'hsla(0, 0%, 0%, 0.12)',
    //   '15': 'hsla(0, 0%, 0%, 0.15)',
    //   '20': 'hsla(0, 0%, 0%, 0.2)',
    //   '30': 'hsla(0, 0%, 0%, 0.3)',
    //   '40': 'hsla(0, 0%, 0%, 0.4)',
    //   '50': 'hsla(0, 0%, 0%, 0.5)',
    //   '60': 'hsla(0, 0%, 0%, 0.6)',
    //   '70': 'hsla(0, 0%, 0%, 0.7)',
    //   '80': 'hsla(0, 0%, 0%, 0.8)',
    //   '90': 'hsla(0, 0%, 0%, 0.9)',
    //   '95': 'hsla(0, 0%, 0%, 0.95)',
    //   main: 'hsl(0, 0%, 0%)'
    // }
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
      'Roboto',
      'Heebo',
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
        // elevation: {
        //   boxShadow: 1
        // }
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

export default theme;
