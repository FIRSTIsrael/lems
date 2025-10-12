import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';

interface Division {
  id: string;
  name: string;
}

interface DivisionStepProps {
  divisions: Division[];
  value: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
}

export function DivisionStep({ divisions, value, isSubmitting, onChange }: DivisionStepProps) {
  const t = useTranslations('pages.login');

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.division')}
      </Typography>
      <Autocomplete
        options={divisions}
        getOptionLabel={option => option.name}
        value={divisions.find(d => d.id === value) || null}
        onChange={(_, newValue) => onChange(newValue?.id || '')}
        renderInput={params => (
          <TextField {...params} label={t('fields.division')} required disabled={isSubmitting} />
        )}
        disabled={isSubmitting}
      />
    </>
  );
}
