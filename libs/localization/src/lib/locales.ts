import { enUS, heIL } from '@mui/material/locale';
import { heIL as xDataGridHeIL, enUS as xDataGridEnUS } from '@mui/x-data-grid/locales';

/**
 * This file contains the locales supported by LEMS
 * and their respective settings.
 */
const Locales = {
  he: {
    displayName: 'עברית',
    id: 'he',
    direction: 'rtl',
    muiLocale: heIL,
    xDataGridLocale: xDataGridHeIL
  },
  en: {
    displayName: 'English',
    id: 'en',
    direction: 'ltr',
    muiLocale: enUS,
    xDataGridLocale: xDataGridEnUS
  }
};

export type Locale = keyof typeof Locales;

export default Locales;
