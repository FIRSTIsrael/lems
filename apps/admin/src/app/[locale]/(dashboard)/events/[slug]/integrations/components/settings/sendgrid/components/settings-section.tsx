'use client';

import { useEffect, useRef, useCallback, useReducer } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  Stack,
  TextField,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Locales, Locale } from '@lems/localization';
import { SendGridSettingsSchema, SendGridSettings } from '@lems/shared/integrations';

type FieldErrors = {
  templateId?: string;
  fromAddress?: string;
  testEmailAddress?: string;
  language?: string;
};

type FormState = {
  formValues: SendGridSettings;
  errors: FieldErrors;
};

type FormAction =
  | { type: 'INITIALIZE'; payload: SendGridSettings }
  | { type: 'UPDATE_FIELD'; field: keyof FieldErrors; value: string }
  | { type: 'SET_ERRORS'; payload: FieldErrors }
  | { type: 'CLEAR_ERRORS' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        formValues: action.payload,
        errors: {}
      };
    case 'UPDATE_FIELD':
      return {
        ...state,
        formValues: {
          ...state.formValues,
          [action.field]: action.field === 'language' ? action.value : (action.value || null)
        },
        errors: {
          ...state.errors,
          [action.field]: undefined
        }
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {}
      };
    default:
      return state;
  }
}

interface SettingsSectionProps {
  settings: Record<string, unknown>;
  onSave: (validated: SendGridSettings) => void;
  onTestEmail: (formValues: SendGridSettings) => Promise<void>;
  isLoading?: boolean;
  showErrors?: boolean;
  isTestingEmail?: boolean;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  onSave,
  onTestEmail,
  isLoading = false,
  showErrors = false,
  isTestingEmail = false
}) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  const initialState: FormState = {
    formValues: {
      templateId: null,
      fromAddress: null,
      testEmailAddress: null,
      language: 'en'
    },
    errors: {}
  };

  const [state, dispatch] = useReducer(formReducer, initialState);
  const { formValues, errors } = state;
  const prevSettingsRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Initialize form
  useEffect(() => {
    const settingsStr = JSON.stringify(settings);
    if (!hasInitializedRef.current || prevSettingsRef.current !== settingsStr) {
      hasInitializedRef.current = true;
      prevSettingsRef.current = settingsStr;

      const newFormValues = {
        templateId: (settings.templateId as string | null) || null,
        fromAddress: (settings.fromAddress as string | null) || null,
        testEmailAddress: (settings.testEmailAddress as string | null) || null,
        emailContactsData: settings.emailContactsData as string | undefined,
        language: ((settings.language as Locale) || 'en') as Locale
      };

      dispatch({ type: 'INITIALIZE', payload: newFormValues });
    }
  }, [settings]);

  // Validate and save when showErrors is true
  useEffect(() => {
    if (!showErrors) return;

    try {
      const validated = SendGridSettingsSchema.parse(formValues);
      dispatch({ type: 'CLEAR_ERRORS' });
      onSave(validated);
    } catch (error) {
      const newErrors: FieldErrors = {};

      if (error instanceof Error) {
        const message = error.message;
        if (message.includes('templateId'))
          newErrors.templateId = t('validation-template-id-required');
        if (message.includes('fromAddress'))
          newErrors.fromAddress = t('validation-from-address-required');
        if (message.includes('testEmailAddress'))
          newErrors.testEmailAddress = t('validation-test-email-required');
      }

      dispatch({ type: 'SET_ERRORS', payload: newErrors });
    }
  }, [showErrors, formValues, onSave, t]);

  const handleFieldChange = useCallback((field: keyof FieldErrors, value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  const handleTestEmail = async () => {
    try {
      await onTestEmail(formValues);
      toast.success(t('csv-success-test-email-sent', { email: formValues.testEmailAddress || '' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('csv-error-send-test-failed');
      toast.error(errorMessage);
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Stack spacing={1}>
        <TextField
          fullWidth
          label={t('template-id-label')}
          placeholder={t('template-id-placeholder')}
          value={formValues.templateId}
          onChange={e => handleFieldChange('templateId', e.target.value)}
          disabled={isLoading}
          error={showErrors && !!errors.templateId}
          helperText={showErrors && errors.templateId ? errors.templateId : t('template-id-help')}
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
          onChange={e => handleFieldChange('fromAddress', e.target.value)}
          disabled={isLoading}
          error={showErrors && !!errors.fromAddress}
          helperText={
            showErrors && errors.fromAddress ? errors.fromAddress : t('from-address-help')
          }
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
          onChange={e => handleFieldChange('testEmailAddress', e.target.value)}
          disabled={isLoading}
          error={showErrors && !!errors.testEmailAddress}
          helperText={
            showErrors && errors.testEmailAddress
              ? errors.testEmailAddress
              : t('test-email-address-help')
          }
          size="small"
        />
      </Stack>

      <Stack spacing={1}>
        <FormControl fullWidth size="small">
          <InputLabel>{t('language-label')}</InputLabel>
          <Select
            value={formValues.language || undefined}
            label={t('language-label')}
            onChange={e => handleFieldChange('language', e.target.value)}
            disabled={isLoading}
          >
            {Object.entries(Locales).map(([localeKey, localeData]) => (
              <MenuItem key={localeKey} value={localeKey}>
                {localeData.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Button
        variant="outlined"
        disabled={isTestingEmail || !formValues.fromAddress || !formValues.templateId}
        onClick={handleTestEmail}
      >
        {isTestingEmail ? <CircularProgress size={24} /> : t('send-test-email-button')}
      </Button>
    </Stack>
  );
};
