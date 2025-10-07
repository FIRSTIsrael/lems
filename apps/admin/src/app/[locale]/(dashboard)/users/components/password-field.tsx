'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { FormikTextField } from '@lems/shared';
import { validatePassword, PasswordRequirements } from './password-validation-indicator';

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  touched?: boolean;
  error?: string;
  value: string;
  showRequirements?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  name,
  label,
  placeholder,
  disabled = false,
  touched = false,
  error,
  value,
  showRequirements = true
}) => {
  const t = useTranslations('pages.users.creation-dialog.form');

  return (
    <Box>
      <FormikTextField
        name={name}
        type="password"
        label={label}
        error={touched && !!error}
        helperText={
          touched && error && error !== 'password-invalid'
            ? t(`errors.${error}`)
            : undefined
        }
        placeholder={placeholder}
        fullWidth
        disabled={disabled}
      />
      {showRequirements && (
        <PasswordRequirements
          validation={validatePassword(value)}
          password={value}
        />
      )}
    </Box>
  );
};

export { validatePassword } from './password-validation-indicator';