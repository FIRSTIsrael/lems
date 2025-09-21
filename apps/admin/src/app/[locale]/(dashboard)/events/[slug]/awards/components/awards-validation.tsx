'use client';

import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAwards } from './awards-context';

export const AwardsValidation = () => {
  const theme = useTheme();
  const t = useTranslations('pages.events.awards.validation');

  const { validation, teamCount } = useAwards();

  const { minimumAwards, maximumAwards, minimumPercentage, maximumPercentage, isValid, reasons } =
    validation;

  const validationColor = isValid ? 'success' : 'error';
  const validationIcon = isValid ? <CheckIcon /> : <ErrorIcon />;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ color: `${validationColor}.main` }}>{validationIcon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('title')}
          </Typography>
          <Chip
            label={isValid ? t('status.valid') : t('status.invalid')}
            color={validationColor}
            variant="outlined"
            size="small"
          />
        </Stack>

        {/* Team Count Info */}
        <Alert severity="info" icon={<InfoIcon />}>
          <AlertTitle>{t('team-info.title')}</AlertTitle>
          {t('team-info.description', { count: teamCount })}
        </Alert>

        {/* Validation Details */}
        <Stack spacing={2}>
          {/* Minimum Awards */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t('minimum.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {minimumAwards} {t('awards')} ({minimumPercentage}%)
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(minimumPercentage, 100)}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.grey[500], 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor:
                    minimumPercentage >= 30 ? theme.palette.success.main : theme.palette.error.main,
                  borderRadius: 1
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {t('minimum.description')}
            </Typography>
          </Box>

          {/* Maximum Awards */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t('maximum.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {maximumAwards} {t('awards')} ({maximumPercentage}%)
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(maximumPercentage, 100)}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.grey[500], 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor:
                    maximumPercentage <= 50 ? theme.palette.success.main : theme.palette.error.main,
                  borderRadius: 1
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {t('maximum.description')}
            </Typography>
          </Box>
        </Stack>

        {/* Validation Rules */}
        <Box
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {t('rules.title')}
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              • {t('rules.minimum-requirement')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {t('rules.maximum-requirement')}
            </Typography>
          </Stack>
        </Box>

        {/* Validation Errors */}
        {!isValid && reasons.length > 0 && (
          <Alert severity="error">
            <AlertTitle>{t('errors.title')}</AlertTitle>
            <Stack spacing={1}>
              {reasons.map((reason, index) => (
                <Typography key={index} variant="body2">
                  • {reason}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}

        {/* Success Message */}
        {isValid && (
          <Alert severity="success">
            <AlertTitle>{t('success.title')}</AlertTitle>
            {t('success.description')}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
