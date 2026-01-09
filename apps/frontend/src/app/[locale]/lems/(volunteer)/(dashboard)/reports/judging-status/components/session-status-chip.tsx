'use client';

import { Chip } from '@mui/material';
import { useTranslations } from 'next-intl';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

interface SessionStatusChipProps {
  status: string;
  called?: boolean;
  arrived?: boolean;
  isQueued?: boolean;
}

export const SessionStatusChip: React.FC<SessionStatusChipProps> = ({
  status,
  called = false,
  arrived = true,
  isQueued = false
}) => {
  const t = useTranslations('pages.judging-status');

  const getStatusIcon = (status: string, called: boolean) => {
    if (status === 'completed') return <CheckCircleRoundedIcon fontSize="small" />;
    if (status === 'in-progress') return <PlayCircleRoundedIcon fontSize="small" />;
    if (called) return <PeopleAltRoundedIcon fontSize="small" />;
    return <RadioButtonUncheckedRoundedIcon fontSize="small" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'success' as const;
    if (status === 'in-progress') return 'primary' as const;
    return 'default' as const;
  };

  if (isQueued) {
    return (
      <Chip
        icon={<PeopleAltRoundedIcon fontSize="small" />}
        label={t('status.queued')}
        color="warning"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  }

  return (
    <>
      <Chip
        icon={getStatusIcon(status, called)}
        label={t(`status.${status}`)}
        color={getStatusColor(status)}
        size="small"
        sx={status === 'in-progress' ? { fontWeight: 600 } : undefined}
      />
      {!arrived && (
        <Chip
          icon={<WarningAmberRoundedIcon />}
          label={t('not-arrived')}
          color="warning"
          size="small"
          variant="outlined"
        />
      )}
    </>
  );
};
