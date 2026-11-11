'use client';

import { Badge, IconButton, Tooltip, alpha, keyframes } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useFinalDeliberation } from '../../final-deliberation-context';

const pulse = (color: string) => keyframes`
  0% { box-shadow: 0 0 0 0 ${alpha(color, 0.6)}; background-color: ${alpha(color, 0.25)}; }
  70% { box-shadow: 0 0 0 10px ${alpha(color, 0)}; background-color: transparent; }
  100% { box-shadow: 0 0 0 0 ${alpha(color, 0)}; background-color: transparent; }
`;

interface AnomalyToggleButtonProps {
  open: boolean;
  onToggle: () => void;
}

export const AnomalyToggleButton: React.FC<AnomalyToggleButtonProps> = ({ open, onToggle }) => {
  const t = useTranslations('pages.deliberations.final.anomalies');
  const { anomalies } = useFinalDeliberation();

  if (anomalies.length === 0) return null;

  return (
    <Tooltip title={t('button')}>
      <IconButton
        color="warning"
        onClick={onToggle}
        sx={theme => ({
          backgroundColor: open ? 'action.selected' : undefined,
          animation: open ? 'none' : `${pulse(theme.palette.warning.main)} 1.6s ease-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
        })}
      >
        <Badge badgeContent={anomalies.length} color="warning">
          <Warning />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};
