'use client';

import { Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';
import { JudgingDeliberation } from '../../graphql';

export interface FinalDeliberationButtonProps {
  deliberations: JudgingDeliberation[];
  loading: boolean;
}

export function FinalDeliberationButton({ deliberations, loading }: FinalDeliberationButtonProps) {
  const t = useTranslations('pages.judge-advisor.awards.deliberation');

  const isDisabled = deliberations.length < 3 || deliberations.some(d => d.status !== 'completed');

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
