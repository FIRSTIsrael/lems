import { enUS, heIL, plPL } from '@mui/material/locale';
import {
  heIL as xDataGridHeIL,
  enUS as xDataGridEnUS,
  plPL as xDataGridPlPL
} from '@mui/x-data-grid/locales';
import {
  heIL as xDatePickersHeIL,
  enUS as xDatePickersEnUS,
  plPL as xDatePickersPlPL
} from '@mui/x-date-pickers/locales';

/**
 * This file contains the locales supported by LEMS
 * and their respective settings.
 */
export const Locales = {
  he: {
    displayName: 'עברית',
    id: 'he',
    direction: 'rtl',
    muiLocale: heIL,
    xDataGridLocale: xDataGridHeIL,
    xDatePickersLocale: xDatePickersHeIL,
    dayjsLocale: 'he'
  },
  en: {
    displayName: 'English',
    id: 'en',
    direction: 'ltr',
    muiLocale: enUS,
    xDataGridLocale: xDataGridEnUS,
    xDatePickersLocale: xDatePickersEnUS,
    dayjsLocale: 'en'
  },
  pl: {
    displayName: 'Polski',
    id: 'pl',
    direction: 'ltr',
    muiLocale: plPL,
    xDataGridLocale: xDataGridPlPL,
    xDatePickersLocale: xDatePickersPlPL,
    dayjsLocale: 'pl'
  }
};

export type Locale = keyof typeof Locales;
