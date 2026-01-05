'use client';

import dayjs from 'dayjs';
import { Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';
import { useTime } from '../../../../../../../../lib/time/hooks';

export interface CategoryDeliberationButtonProps {
  category: string;
  startTime?: string;
  sessionLength: number;
  loading: boolean;
}

export function CategoryDeliberationButton({
  category,
  startTime,
  sessionLength,
  loading
}: CategoryDeliberationButtonProps) {
  const t = useTranslations('pages.judge-advisor.awards.deliberation');
  const currentTime = useTime({ interval: 1000 });

  // Calculate if the button should be disabled
  const isDisabled =
    !startTime || currentTime.isBefore(dayjs(startTime).add(sessionLength, 'milliseconds'));

  return (
    <Button
      fullWidth
      size="small"
      variant="outlined"
      endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
      target="_blank"
      href={`/lems/deliberation/${category}`}
      disabled={loading || isDisabled}
      sx={{
        fontWeight: 600,
        textTransform: 'none',
        whiteSpace: 'nowrap'
      }}
    >
      {t('open')}
    </Button>
  );
}
