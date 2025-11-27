'use client';

import { Box, Typography, Stack, alpha } from '@mui/material';
import { Check } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { LoginStep } from '../types';

interface StepIndicatorProps {
  currentStep: LoginStep;
  completedSteps: LoginStep[];
  availableSteps: LoginStep[];
}

const stepOrder = [
  LoginStep.Role,
  LoginStep.Division,
  LoginStep.RoleInfo,
  LoginStep.User,
  LoginStep.Password
];

export function StepIndicator({ currentStep, completedSteps, availableSteps }: StepIndicatorProps) {
  const t = useTranslations('pages.login.steps');

  const getStepLabel = (step: LoginStep): string => {
    switch (step) {
      case LoginStep.Role:
        return t('role');
      case LoginStep.Division:
        return t('division');
      case LoginStep.RoleInfo:
        return t('association');
      case LoginStep.User:
        return t('user');
      case LoginStep.Password:
        return t('password');
      default:
        return '';
    }
  };

  const visibleSteps = stepOrder.filter(step => availableSteps.includes(step));
  const currentStepIndex = visibleSteps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / visibleSteps.length) * 100;

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box
        sx={{
          position: 'relative',
          height: 4,
          background: theme =>
            `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: theme =>
              `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: theme => `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`
          }}
        />
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {visibleSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <Box
              key={step}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted
                    ? theme =>
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                    : isCurrent
                      ? theme =>
                          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                      : theme => alpha(theme.palette.grey[400], 0.2),
                  border: theme =>
                    isCurrent
                      ? `2px solid ${theme.palette.primary.main}`
                      : isCompleted
                        ? 'none'
                        : `2px solid ${alpha(theme.palette.grey[400], 0.3)}`,
                  color: isCompleted || isCurrent ? 'white' : theme => theme.palette.grey[400],
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isCurrent
                    ? theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                    : isCompleted
                      ? theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                      : 'none',
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {isCompleted ? <Check fontSize="small" /> : index + 1}
              </Box>

              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCompleted || isCurrent ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  opacity: isUpcoming ? 0.5 : 1
                }}
              >
                {getStepLabel(step)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
