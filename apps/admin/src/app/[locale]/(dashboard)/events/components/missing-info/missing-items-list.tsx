'use client';

import { Box, Collapse, List, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { MissingInfoItem, type MissingItem } from './missing-info-item';

interface MissingItemsListProps {
  items: MissingItem[];
  expanded: boolean;
}

export const MissingItemsList: React.FC<MissingItemsListProps> = ({ items, expanded }) => {
  const t = useTranslations('pages.events.missing-info');

  return (
    <Collapse in={expanded}>
      <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('missing-items-title')}:
        </Typography>
        <List dense sx={{ py: 0 }}>
          {items.map((item, index) => (
            <MissingInfoItem key={index} item={item} />
          ))}
        </List>
      </Box>
    </Collapse>
  );
};
