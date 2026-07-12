import { Chip, ChipProps } from '@mui/material';
import { useMatchTranslations, useJudgingSessionTranslations } from '@lems/localization';
import type { MatchStatus, SessionStatus } from '../graphql';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  type: 'match' | 'session';
  status: MatchStatus | SessionStatus;
}

export function StatusChip({ type, status, ...props }: StatusChipProps) {
  const matchTranslations = useMatchTranslations();
  const sessionTranslations = useJudgingSessionTranslations();

  const colorMap: Record<string, ChipProps['color']> = {
    'not-started': 'default',
    'in-progress': 'primary',
    completed: 'success'
  };

  const getLabel = () => {
    if (type === 'match') {
      return matchTranslations.getStatus(status as MatchStatus);
    }
    return sessionTranslations.getStatus(status as SessionStatus);
  };

  return (
    <Chip {...props} label={getLabel()} color={colorMap[status] ?? 'default'} variant="filled" />
  );
}
