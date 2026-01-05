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
        variant="body2"
        sx={{
          flex: 1,
          fontSize: compact ? '0.8rem' : '0.9rem',
          color: 'text.primary',
          fontWeight: 500
        }}
      >
        {tFields(`${field.category}.${field.fieldId}`)}
      </Typography>
      <Chip
        label={field.value ?? 'N/A'}
        size="medium"
        color={field.color}
        sx={{
          minWidth: compact ? 40 : 48,
          height: compact ? 24 : 28,
          fontSize: compact ? '0.8rem' : '0.9rem',
          fontWeight: 600,
          '& .MuiChip-label': {
            px: compact ? 0.75 : 1,
            fontSize: compact ? '0.8rem' : '0.9rem'
          }
        }}
      />
    </Stack>
  );
}
