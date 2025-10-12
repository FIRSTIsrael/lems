import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';

interface Association {
  key: string;
  value: string;
  label: string;
}

interface AssociationStepProps {
  associations: Association[];
  value: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
}

export function AssociationStep({
  associations,
  value,
  isSubmitting,
  onChange
}: AssociationStepProps) {
  const t = useTranslations('pages.login');

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.association')}
      </Typography>
      <Autocomplete
        options={associations}
        getOptionLabel={option => option.label}
        value={associations.find(a => a.value === value) || null}
        onChange={(_, newValue) => onChange(newValue?.value || '')}
        renderInput={params => (
          <TextField {...params} label={t('fields.association')} required disabled={isSubmitting} />
        )}
        disabled={isSubmitting}
      />
    </>
  );
}
