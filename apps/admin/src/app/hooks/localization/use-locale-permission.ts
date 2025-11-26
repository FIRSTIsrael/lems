import { useTranslations } from 'next-intl';
import { PermissionType } from '@lems/database';

export const useLocalePermissionName = () => {
  const t = useTranslations('general.permissions');
  return (permission: PermissionType) => t(permission.toLowerCase().replace(/_/g, '-'));
};
