import { createTheme, Shadows } from '@mui/material/styles';
import { Locales, Locale } from '@lems/localization';

export const defaultColor = '#003d6a';

declare module '@mui/material/styles' {
  interface Palette {
    award: {
      first: string;
      second: string;
      third: string;
      other: string;
    };
  }

  interface PaletteOptions {
    award?: {
      first?: string;
      second?: string;
      third?: string;
      other?: string;
    };
  }
}

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

const baseTheme = createTheme({
  shape: {
    borderRadius: 8
  },
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
  },
  shadows: softShadows
});

export const mainTheme = createTheme(baseTheme, {
  palette: {
    award: { first: '#fecb4d', second: '#A7AB99', third: '#b08053', other: '#5ebad9' }
  }
});

export const getLocalizedTheme = (locale: Locale = 'he') => {
  const { direction, muiLocale, xDataGridLocale, xDatePickersLocale } = Locales[locale];
  return createTheme(baseTheme, { direction }, muiLocale, xDataGridLocale, xDatePickersLocale);
};
