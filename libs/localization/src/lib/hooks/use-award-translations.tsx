import { useTranslations } from 'next-intl';
import { RichText } from '../rich-text';

export const useAwardTranslations = () => {
  const t = useTranslations('shared.awards');

  return {
    getName: (awardId: string) => t(`${awardId}.name`),
    getDescription: (awardId: string) => (
      <RichText>{tags => t.rich(`${awardId}.description`, tags)}</RichText>
    )
  };
};
