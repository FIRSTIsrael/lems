import { Chip, ChipProps } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import type { MatchStatus, SessionStatus } from '../graphql';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  type: 'match' | 'session';
  status: MatchStatus | SessionStatus;
}

// TODO: Add session stage translation hook
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StatusChip({ type, status, ...props }: StatusChipProps) {
  const { getStatus } = useMatchTranslations();

  const colorMap: Record<string, ChipProps['color']> = {
    'not-started': 'default',
    'in-progress': 'primary',
    completed: 'success'
  };

  return (
    <Chip
      {...props}
      label={getStatus(status as MatchStatus)}
      color={colorMap[status] ?? 'default'}
      variant="filled"
    />
  );
}
