'use client';

import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useTranslations } from 'next-intl';

interface FieldQueuerBottomNavProps {
  value: string;
  onChange: (value: string) => void;
}

export function FieldQueuerBottomNav({ value, onChange }: FieldQueuerBottomNavProps) {
  const t = useTranslations('pages.field-queuer');

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
      elevation={3}
    >
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction
          label={t('field-schedule.tab-label')}
          value="schedule"
          icon={<CalendarMonthOutlinedIcon />}
        />
        <BottomNavigationAction label={t('home')} value="home" icon={<HomeOutlinedIcon />} />
        <BottomNavigationAction
          label={t('pit-map.tab-label')}
          value="pit-map"
          icon={<MapOutlinedIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}
