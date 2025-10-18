import { Typography, Autocomplete, TextField, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useVolunteer } from '../volunteer-context';

interface DivisionStepProps {
  value: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
}

export function DivisionStep({ value, isSubmitting, onChange }: DivisionStepProps) {
  const t = useTranslations('pages.login');
  const { volunteerData, isReady } = useVolunteer();

  if (!isReady || !volunteerData) {
    return null;
  }

  const divisionsWithVolunteers = new Set(
    volunteerData.volunteers.flatMap(v => v.divisions.map(d => d.id))
  );

  const availableDivisions = volunteerData.divisions.filter(d => divisionsWithVolunteers.has(d.id));

  const selectedDivision = availableDivisions.find(d => d.id === value) || null;

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.division')}
      </Typography>
      <Autocomplete
        options={availableDivisions}
        getOptionLabel={option => option.name}
        value={selectedDivision}
        onChange={(_, newValue) => onChange(newValue?.id || '')}
        renderInput={params => (
          <TextField {...params} label={t('fields.division')} required disabled={isSubmitting} />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: option.color,
                flexShrink: 0
              }}
            />
            {option.name}
          </Box>
        )}
        disabled={isSubmitting}
      />
    </>
  );
}
