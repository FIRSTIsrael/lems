import { useTranslations } from 'next-intl';

export const useRoleTranslations = () => {
  const t = useTranslations('shared.roles');

  return {
    getRole: (roleId: string) => t(`${roleId}.name`)
  };
};
