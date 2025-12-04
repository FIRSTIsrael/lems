'use client';

import { Paper, Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useSuspenseQuery } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { useAwardTranslations } from '@lems/localization';
import { useEvent } from '../../../../../../components/event-context';
import { GET_AWARD_OPTIONS_QUERY, parseAwardOptions } from '../rubric.graphql';

interface AwardNominationsProps {
  hasAwards: boolean;
  disabled?: boolean;
}

export const AwardNominations: React.FC<AwardNominationsProps> = ({
  hasAwards,
  disabled = false
}) => {
  const t = useTranslations('pages.rubric.award-nominations');
  const { currentDivision } = useEvent();

  const { getName, getDescription } = useAwardTranslations();

  const { data: awards } = useSuspenseQuery(GET_AWARD_OPTIONS_QUERY, {
    variables: {
      divisionId: currentDivision.id
    }
  });

  const awardOptions = parseAwardOptions(awards);

  if (!hasAwards) return null;

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
                  control={<Checkbox disabled={disabled} size="small" />}
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
