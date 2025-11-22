'use client';

import { Paper, Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useAwardTranslations } from '@lems/localization';

interface AwardNominationsProps {
  hasAwards: boolean;
  disabled?: boolean;
  awardIds?: string[];
}

export const AwardNominations: React.FC<AwardNominationsProps> = ({
  hasAwards,
  disabled = false,
  awardIds = []
}) => {
  const t = useTranslations('pages.rubric.award-nominations');
  const { getName, getDescription } = useAwardTranslations();

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
          {awardIds.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
              {t('no-awards')}
            </Typography>
          ) : (
            awardIds.map(awardId => (
              <Stack key={awardId} spacing={0.5}>
                <FormControlLabel
                  control={<Checkbox disabled={disabled} size="small" />}
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      {getName(awardId)}
                    </Typography>
                  }
                />
                <Typography variant="caption" color="textSecondary" sx={{ ml: 4 }}>
                  {getDescription(awardId)}
                </Typography>
              </Stack>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
