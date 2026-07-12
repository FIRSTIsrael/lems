'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { useJudgeAdvisor } from '../judge-advisor-context';

export interface CategoryDeliberationButtonProps {
  category: string;
}

export function CategoryDeliberationButton({ category }: CategoryDeliberationButtonProps) {
  const t = useTranslations('pages.judge-advisor.awards.deliberation');
  const searchParams = useSearchParams();
  const currentTime = useTime({ interval: 1000 });
  const { sessions, sessionLength, loading } = useJudgeAdvisor();

  const latestSessionTime = useMemo(() => {
    if (sessions.length === 0) return null;
    return dayjs(
      sessions.reduce((max, session) =>
        dayjs(session.scheduledTime).isAfter(dayjs(max.scheduledTime)) ? session : max
      ).scheduledTime
    );
  }, [sessions]);

  const isDisabled =
    !latestSessionTime || currentTime.isBefore(latestSessionTime.add(sessionLength, 'seconds'));

  const queryString = searchParams.toString();
  const href = `/lems/deliberation/${category}${queryString ? `?${queryString}` : ''}`;

  return (
    <Button
      fullWidth
      size="small"
      variant="outlined"
      endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
      target="_blank"
      href={href}
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
