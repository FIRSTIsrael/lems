'use client';

import { useTranslations } from 'next-intl';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';

interface JudgingQueuerBottomNavProps {
  value: string;
  onChange: (value: string) => void;
}

export function JudgingQueuerBottomNav({ value, onChange }: JudgingQueuerBottomNavProps) {
  const t = useTranslations('pages.judging-queuer.bottom-nav');

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation value={value} onChange={(_, newValue) => onChange(newValue)} showLabels>
        <BottomNavigationAction
          label={t('schedule')}
          value="schedule"
          icon={<CalendarMonthIcon />}
        />
        <BottomNavigationAction label={t('home')} value="home" icon={<HomeIcon />} />
        <BottomNavigationAction label={t('pit-map')} value="pit-map" icon={<MapIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
