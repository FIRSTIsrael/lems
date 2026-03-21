'use client';

import { useTranslations } from 'next-intl';
import { Stack, TextField } from '@mui/material';

export interface SendGridFormValues extends Record<string, unknown> {
  templateId: string;
  fromAddress: string;
  testEmailAddress: string;
}

export const SendGridForm: React.FC<{
  formValues: SendGridFormValues;
  onFieldChange: (field: keyof SendGridFormValues, value: string) => void;
  errors: Partial<SendGridFormValues>;
}> = ({ formValues, onFieldChange, errors }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <TextField
          fullWidth
          label={t('template-id-label')}
          placeholder={t('template-id-placeholder')}
          value={formValues.templateId}
          onChange={e => onFieldChange('templateId', e.target.value)}
          error={!!errors.templateId}
          helperText={errors.templateId ? errors.templateId : t('template-id-help')}
          size="small"
        />
      </Stack>

      <Stack spacing={1}>
        <TextField
          fullWidth
          label={t('from-address-label')}
          type="email"
          placeholder={t('from-address-placeholder')}
          value={formValues.fromAddress}
          onChange={e => onFieldChange('fromAddress', e.target.value)}
          error={!!errors.fromAddress}
          helperText={errors.fromAddress ? errors.fromAddress : t('from-address-help')}
          size="small"
        />
      </Stack>

      <Stack spacing={1}>
        <TextField
          fullWidth
          label={t('test-email-address-label')}
          type="email"
          placeholder={t('test-email-address-placeholder')}
          value={formValues.testEmailAddress}
          onChange={e => onFieldChange('testEmailAddress', e.target.value)}
          error={!!errors.testEmailAddress}
          helperText={
            errors.testEmailAddress ? errors.testEmailAddress : t('test-email-address-help')
          }
          size="small"
        />
      </Stack>
    </Stack>
  );
};
