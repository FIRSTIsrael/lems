'use client';

import { Chip } from '@mui/material';
import { useTranslations } from 'next-intl';

interface EditionBadgeProps {
  isFuture: boolean;
  size?: 'small' | 'medium';
}

export const EditionBadge: React.FC<EditionBadgeProps> = ({ isFuture, size = 'small' }) => {
  const t = useTranslations('shared.edition');
  if (!isFuture) return null;
  return <Chip label={t('future')} size={size} color="secondary" />;
};
