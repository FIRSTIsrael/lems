import { enUS, heIL } from '@mui/material/locale';
import { heIL as xDataGridHeIL, enUS as xDataGridEnUS } from '@mui/x-data-grid/locales';

const PortalLocales = {
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

export type Locales = keyof typeof PortalLocales;

export default PortalLocales;
