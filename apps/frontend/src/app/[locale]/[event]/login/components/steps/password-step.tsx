import { useState } from 'react';
import { Typography, IconButton, InputAdornment, Box, Button, alpha } from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, Login } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { FormikTextField } from '@lems/shared';
import { LoginFormValues } from '../../types';

export function PasswordStep({disableAfterSuccess}: {disableAfterSuccess: boolean}) {
  const t = useTranslations('pages.login');
  const [showPassword, setShowPassword] = useState(false);
  const { isSubmitting, isValid } = useFormikContext<LoginFormValues>();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`
          }}
        >
          <LockOutlined sx={{ color: 'primary.main', fontSize: '1.25rem' }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          {t('steps.password')}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        {t('instructions.password')}
      </Typography>
      <FormikTextField
        name="password"
        variant="outlined"
        type={showPassword ? 'text' : 'password'}
        label={t('fields.password')}
        helperText={t('fields.password-helper')}
        disabled={isSubmitting }
        autoComplete="off"
        required
        slotProps={{
          htmlInput: {
            maxLength: 4,
            style: {
              fontSize: '1.5rem',
              letterSpacing: '0.5em',
              textAlign: 'center',
              fontWeight: 600
            }
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      background: theme => alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }
        }}
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`
            },
            '&.Mui-focused': {
              boxShadow: theme => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`
            }
          }
        }}
      />
      <Box display="flex" justifyContent="center" width="100%">
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting || disableAfterSuccess || !isValid}
          startIcon={<Login />}
          sx={{
            borderRadius: 3,
            py: 2,
            px: 5,
            width: { xs: '100%', sm: '70%' },
            fontWeight: 700,
            fontSize: '1.1rem',
            background: theme =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: theme =>
              `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}, 0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: theme =>
                `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              transform: 'translateY(-3px)',
              boxShadow: theme =>
                `0 8px 28px ${alpha(theme.palette.primary.main, 0.6)}, 0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}`
            },
            '&:active': {
              transform: 'translateY(-1px)'
            },
            '&.Mui-disabled': {
              background: theme => alpha(theme.palette.grey[400], 0.3),
              color: theme => alpha(theme.palette.text.primary, 0.4)
            }
          }}
        >
          {isSubmitting ? t('submitting') : t('sign-in')}
        </Button>
      </Box>
    </Box>
  );
}
