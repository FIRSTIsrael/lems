import { Stepper, Step, StepLabel } from '@mui/material';
import { useTranslations } from 'next-intl';

interface LoginStepperProps {
  activeSteps: string[];
  currentStepIndex: number;
}

export function LoginStepper({ activeSteps, currentStepIndex }: LoginStepperProps) {
  const t = useTranslations('pages.login');

  return (
    <Stepper activeStep={currentStepIndex} sx={{ mb: 4 }}>
      {activeSteps.map(step => (
        <Step key={step}>
          <StepLabel>{t(`steps.${step}`)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
