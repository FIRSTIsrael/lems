'use client';

import { redirect, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { useUser } from '../../components/user-context';

interface RubricLayoutProps {
  children: React.ReactNode;
}

export default function CategoryDeliberationLayout({ children }: RubricLayoutProps) {
  const t = useTranslations('layouts.deliberation');

  const user = useUser();
  const { category } = useParams();

  const JudgingCategories = new Set(['core-values', 'robot-design', 'innovation-project']);
  if (!category || typeof category !== 'string' || !JudgingCategories.has(category)) {
    throw new Error('Invalid judging category');
  }

  const userCategory = user.roleInfo?.['category'];
  if (userCategory && userCategory !== category) {
    toast.error(t('error-not-authorized'));
    redirect(`/lems/${user.role}`);
  }

  return <>{children}</>;
}
