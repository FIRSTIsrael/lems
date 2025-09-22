'use client';

import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('pages.index');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
