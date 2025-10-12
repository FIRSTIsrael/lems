import { useState } from 'react';
import { Typography, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { FormikTextField } from '@lems/shared';

interface PasswordStepProps {
  isSubmitting: boolean;
}

export function PasswordStep({ isSubmitting }: PasswordStepProps) {
  const t = useTranslations('pages.login');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.password')}
      </Typography>
      <FormikTextField
        name="password"
        variant="outlined"
        type={showPassword ? 'text' : 'password'}
        label={t('fields.password')}
        helperText={t('fields.password-helper')}
        disabled={isSubmitting}
        autoComplete="off"
        required
        inputProps={{
          maxLength: 4
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }
        }}
      />
    </>
  );
}
