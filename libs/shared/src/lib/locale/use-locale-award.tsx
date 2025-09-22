import { useTranslations } from 'next-intl';
import { RichText } from './rich-text';

export const useLocaleAwardName = () => {
  const t = useTranslations('shared.awards');
  return (award: string) => t(`${award}.name`);
};

export const useLocaleAwardDescription = () => {
  const t = useTranslations('shared.awards');
  return (award: string) => <RichText>{tags => t.rich(`${award}.description`, tags)}</RichText>;
};
