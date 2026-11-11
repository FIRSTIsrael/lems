'use client';

import { Chip, Tooltip } from '@mui/material';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Anomaly } from '../../final-deliberation-computation';

interface AnomalyDifferenceChipProps {
  anomaly: Anomaly;
}

export const AnomalyDifferenceChip: React.FC<AnomalyDifferenceChipProps> = ({ anomaly }) => {
  const t = useTranslations('pages.deliberations.final.anomalies');

  return (
    <Tooltip title={t(anomaly.isHigher ? 'higher' : 'lower', { difference: anomaly.difference })}>
      <Chip
        size="small"
        variant="outlined"
        color={anomaly.isHigher ? 'success' : 'error'}
        icon={anomaly.isHigher ? <ArrowUpward /> : <ArrowDownward />}
        label={anomaly.difference}
        sx={{ fontWeight: 600 }}
      />
    </Tooltip>
  );
};
