'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';
import { useJudgeAdvisor } from '../judge-advisor-context';

export function FinalDeliberationButton() {
  const t = useTranslations('pages.judge-advisor.awards.deliberation');
  const searchParams = useSearchParams();
  const { deliberations, loading } = useJudgeAdvisor();

  const deliberationsArray = Object.values(deliberations).filter(d => !!d);
  const isDisabled =
    deliberationsArray.length < 3 || deliberationsArray.some(d => d.status !== 'completed');

  const queryString = searchParams.toString();
  const href = `/lems/deliberation/final${queryString ? `?${queryString}` : ''}`;

  return (
    <Button
      fullWidth
      variant="contained"
      endIcon={<OpenInNewIcon />}
      target="_blank"
      href={href}
      disabled={loading || isDisabled}
      sx={{
        py: 1.5,
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '1rem'
      }}
    >
      {t('open-final')}
    </Button>
  );
}
