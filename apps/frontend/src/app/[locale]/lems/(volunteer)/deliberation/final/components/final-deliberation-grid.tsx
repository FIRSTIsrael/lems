'use client';

import { FinalDeliberationStage } from '@lems/database';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  alpha
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useFinalDeliberation } from '../final-deliberation-context';
import { ChampionsStage } from './champions/champions-stage';
import { CoreAwardsStage } from './core-awards/core-awards-stage';
import { OptionalAwardsStage } from './optional-awards/optional-awards-stage';
import { ReviewStage } from './review/review-stage';
import { AnomalyAlert } from './anomaly-alert';

const STAGES: FinalDeliberationStage[] = ['champions', 'core-awards', 'optional-awards', 'review'];

export const FinalDeliberationGrid: React.FC = () => {
  const t = useTranslations('pages.deliberations.final');
  const theme = useTheme();
  const router = useRouter();
  const { deliberation, anomalies, deliberationAwards } = useFinalDeliberation();

  // Determine visible stages based on whether optional awards exist
  const visibleStages = useMemo(() => {
    if (!deliberation) {
      return STAGES;
    }

    const hasOptionalAwards = deliberationAwards.some(
      award => award.isOptional && award.name !== 'excellence-in-engineering'
    );

    return hasOptionalAwards ? STAGES : STAGES.filter(stage => stage !== 'optional-awards');
  }, [deliberation, deliberationAwards]);

  // Get current stage index
  const currentStageIndex = useMemo(() => {
    if (!deliberation) {
      return 0;
    }
    return visibleStages.indexOf(deliberation.stage);
  }, [deliberation, visibleStages]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ minHeight: 56, gap: 1 }}>
          <IconButton
            edge="start"
            color="primary"
            onClick={() => router.push('/lems')}
            sx={{ mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, color: 'text.primary' }}>
            {t('title')}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Stepper Section - Full Width with Visual Separation */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: alpha(theme.palette.primary.light, 0.1),
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 2,
          px: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Stepper
          activeStep={currentStageIndex}
          sx={{
            width: '100%',
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.7rem', sm: '0.8rem' },
              fontWeight: 600
            },
            '& .MuiStepConnector-line': {
              minHeight: 2
            }
          }}
        >
          {visibleStages.map(stage => (
            <Step key={stage}>
              <StepLabel>{t(`stepper.${stage}`)}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <AnomalyAlert anomalies={anomalies} />
      </Box>

      {/* Main Content - Flex grow to fill remaining space */}
      {deliberation?.stage === 'champions' && <ChampionsStage />}
      {deliberation?.stage === 'core-awards' && <CoreAwardsStage />}
      {deliberation?.stage === 'optional-awards' && <OptionalAwardsStage />}
      {deliberation?.stage === 'review' && <ReviewStage />}
    </Box>
  );
};
