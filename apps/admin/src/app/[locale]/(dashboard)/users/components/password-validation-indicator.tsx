'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const validatePassword = (password: string): PasswordValidation => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

export const PasswordRequirements: React.FC<{
  validation: PasswordValidation;
  password: string;
}> = ({ validation }) => {
  const t = useTranslations('pages.users.creation-dialog.form.password-validation');

  const conditions = [
    { key: 'minLength', met: validation.minLength },
    { key: 'hasUppercase', met: validation.hasUppercase },
    { key: 'hasLowercase', met: validation.hasLowercase },
    { key: 'hasNumber', met: validation.hasNumber },
    { key: 'hasSpecialChar', met: validation.hasSpecialChar }
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t('title')}
      </Typography>
      <List dense sx={{ py: 0 }}>
        {conditions.map(condition => (
          <ListItem key={condition.key} sx={{ py: 0, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              {condition.met ? (
                <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <CloseIcon sx={{ fontSize: 16, color: 'error.main' }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={t(condition.key)}
              slotProps={{
                primary: {
                  variant: 'body2',
                  color: condition.met ? 'success.main' : 'error.main'
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
