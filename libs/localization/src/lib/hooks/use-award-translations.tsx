import { useTranslations } from 'next-intl';
import { getAwardLabelKey } from '@lems/shared/awards';
import type { Edition } from '@lems/shared/edition';
import { RichText } from '../rich-text';

export const useAwardTranslations = (edition: Edition = 'founders') => {
  const t = useTranslations('shared.awards');

  return {
    getName: (awardId: string) => t(`${getAwardLabelKey(awardId, edition)}.name`),
    getDescription: (awardId: string) => (
      <RichText>
        {tags => t.rich(`${getAwardLabelKey(awardId, edition)}.description`, tags)}
      </RichText>
    )
  };
};
