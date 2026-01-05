import { Stack, Typography, Chip } from '@mui/material';
import type { RubricField } from './rubric-scores-utils';

interface RubricFieldRowProps {
  field: RubricField;
  tFields: (key: string) => string;
  compact?: boolean;
}

export function RubricFieldRow({ field, tFields, compact = false }: RubricFieldRowProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={compact ? 0.5 : 1}
    >
      <Typography
        variant="caption"
        sx={{
          flex: 1,
          fontSize: compact ? '0.65rem' : '0.7rem',
          color: 'text.primary'
        }}
      >
        {tFields(`${field.category}.${field.fieldId}`)}
      </Typography>
      <Chip
        label={field.value ?? 'N/A'}
        size="small"
        color={field.color}
        sx={{
          minWidth: compact ? 32 : 40,
          height: compact ? 18 : 20,
          fontSize: compact ? '0.65rem' : '0.7rem',
          ...(compact && { '& .MuiChip-label': { px: 0.5 } })
        }}
      />
    </Stack>
  );
}
