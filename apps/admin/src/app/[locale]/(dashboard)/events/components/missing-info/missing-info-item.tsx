'use client';

import { ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { EmojiEvents, Group, Schedule } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

export interface MissingItem {
  type: 'awards' | 'users' | 'schedule';
}

interface MissingInfoItemProps {
  item: MissingItem;
}

export const MissingInfoItem: React.FC<MissingInfoItemProps> = ({ item }) => {
  const t = useTranslations('pages.events.missing-info');

  const getIcon = (type: MissingItem['type']) => {
    switch (type) {
      case 'awards':
        return <EmojiEvents color="warning" />;
      case 'users':
        return <Group color="warning" />;
      case 'schedule':
        return <Schedule color="warning" />;
    }
  };

  const getLabel = (type: MissingItem['type']) => {
    switch (type) {
      case 'awards':
        return t('missing-awards');
      case 'users':
        return t('missing-users');
      case 'schedule':
        return t('missing-schedule');
    }
  };

  return (
    <ListItem sx={{ py: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36 }}>{getIcon(item.type)}</ListItemIcon>
      <ListItemText primary={<Typography variant="body2">{getLabel(item.type)}</Typography>} />
    </ListItem>
  );
};
