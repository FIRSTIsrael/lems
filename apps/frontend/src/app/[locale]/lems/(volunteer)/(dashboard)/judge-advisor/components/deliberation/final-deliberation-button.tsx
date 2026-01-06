'use client';

import { Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';
import { useJudgeAdvisor } from '../judge-advisor-context';

export function FinalDeliberationButton() {
  const t = useTranslations('pages.judge-advisor.awards.deliberation');
  const { deliberations, loading } = useJudgeAdvisor();

  const deliberationsArray = Object.values(deliberations).filter(d => !!d);
  const isDisabled =
    deliberationsArray.length < 3 || deliberationsArray.some(d => d.status !== 'completed');

  return (
    <Button
      fullWidth
      variant="contained"
      endIcon={<OpenInNewIcon />}
      target="_blank"
      href="/lems/deliberation/final"
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
