'use client';

import { useCallback, useMemo } from 'react';
import { Paper, Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { useAwardTranslations } from '@lems/localization';
import { useEvent } from '../../../../../../components/event-context';
import { UPDATE_RUBRIC_AWARDS_MUTATION } from '../graphql';
import { useRubric } from '../rubric-context';

interface AwardNominationsProps {
  awards: { id: string; name: string }[];
  disabled?: boolean;
}

export const AwardNominations: React.FC<AwardNominationsProps> = ({ awards, disabled = false }) => {
  const t = useTranslations('pages.rubric.award-nominations');
  const { currentDivision } = useEvent();
  const { rubric } = useRubric();
  const { getName, getDescription } = useAwardTranslations();

  const awardOptions = useMemo(() => new Set(awards.map(award => award.name)), [awards]);
  const currentAwards = useMemo(() => {
    const awards = rubric.data?.awards || {};
    if (Array.isArray(awards)) {
      return new Set(awards);
    }
    return new Set(Object.keys(awards).filter(key => awards[key as keyof typeof awards]));
  }, [rubric.data?.awards]);

  const [updateRubricAwards] = useMutation(UPDATE_RUBRIC_AWARDS_MUTATION, {
    errorPolicy: 'all',
    onError: (err: Error) => {
      console.error('[AwardNominations] Update awards mutation error:', err);
    }
  });

  const handleAwardChange = useCallback(
    async (awardName: string, isChecked: boolean) => {
      const updatedAwards = new Set(currentAwards);
      if (isChecked) {
        updatedAwards.add(awardName);
      } else {
        updatedAwards.delete(awardName);
      }

      // Convert Set to Record<string, boolean>
      const awardsRecord: Record<string, boolean> = {};
      awardOptions.forEach(award => {
        awardsRecord[award] = updatedAwards.has(award);
      });

      try {
        await updateRubricAwards({
          variables: {
            divisionId: currentDivision.id,
            rubricId: rubric.id,
            awards: awardsRecord
          }
        });
      } catch (err) {
        console.error(`[AwardNominations] Failed to update award ${awardName}:`, err);
        throw err;
      }
    },
    [updateRubricAwards, currentDivision.id, rubric.id, currentAwards, awardOptions]
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontSize="1.125rem" fontWeight={600}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            {t('description')}
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {[...awardOptions].length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
              {t('no-awards')}
            </Typography>
          ) : (
            [...awardOptions].map(awardName => (
              <Stack key={awardName} spacing={0.5}>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={disabled}
                      size="small"
                      checked={currentAwards.has(awardName)}
                      onChange={e => handleAwardChange(awardName, e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      {getName(awardName)}
                    </Typography>
                  }
                />
                <Typography variant="caption" color="textSecondary" sx={{ pl: 5 }}>
                  {getDescription(awardName)}
                </Typography>
              </Stack>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
