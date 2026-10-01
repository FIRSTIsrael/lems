'use client';

import { Chip } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Edition } from '../edition';

interface EditionBadgeProps {
  edition: Edition;
  size?: 'small' | 'medium';
}

export const EditionBadge: React.FC<EditionBadgeProps> = ({ edition, size = 'small' }) => {
  const t = useTranslations('shared.edition');
  if (edition === 'founders') return null;
  return <Chip label={t(edition)} size={size} color="secondary" />;
};
