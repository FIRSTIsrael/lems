import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';

interface RoleStepProps {
  roles: string[];
  value: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
}

export function RoleStep({ roles, value, isSubmitting, onChange }: RoleStepProps) {
  const t = useTranslations('pages.login');

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.role')}
      </Typography>
      <Autocomplete
        options={roles}
        value={value || null}
        onChange={(_, newValue) => onChange(newValue || '')}
        renderInput={params => (
          <TextField {...params} label={t('fields.role')} required disabled={isSubmitting} />
        )}
        disabled={isSubmitting}
      />
    </>
  );
}
