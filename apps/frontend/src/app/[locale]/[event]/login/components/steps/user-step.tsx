import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';

interface UserStepProps {
  value: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
}

export function UserStep({ value, isSubmitting, onChange }: UserStepProps) {
  const t = useTranslations('pages.login');

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.user')}
      </Typography>
      <Autocomplete
        options={users}
        getOptionLabel={option => option.identifier || option.id}
        value={users.find(u => u.id === value) || null}
        onChange={(_, newValue) => onChange(newValue?.id || '')}
        renderInput={params => (
          <TextField {...params} label={t('fields.user')} required disabled={isSubmitting} />
        )}
        disabled={isSubmitting}
      />
    </>
  );
}
