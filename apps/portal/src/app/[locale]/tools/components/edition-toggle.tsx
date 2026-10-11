'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { Edition } from '@lems/shared/edition';
import { useToolEdition } from '../hooks/use-tool-edition';

export const EditionToggle: React.FC = () => {
  const t = useTranslations('pages.tools.edition');
  const edition = useToolEdition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: Edition | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'founders') params.delete('edition');
    else params.set('edition', value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <ToggleButtonGroup exclusive size="small" value={edition} onChange={handleChange}>
      <ToggleButton value="founders">{t('founders')}</ToggleButton>
      <ToggleButton value="future">{t('future')}</ToggleButton>
    </ToggleButtonGroup>
  );
};
