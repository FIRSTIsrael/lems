import { useState } from 'react';
import { Typography, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { FormikTextField } from '@lems/shared';
import { LoginFormValues } from '../../types';

export function PasswordStep() {
  const t = useTranslations('pages.login');
  const [showPassword, setShowPassword] = useState(false);
  const { isSubmitting } = useFormikContext<LoginFormValues>();

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
        slotProps={{
          htmlInput: {
            maxLength: 4
          },
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
