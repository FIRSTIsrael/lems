'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { SendGridSettingsSchema } from '@lems/shared/integrations';
import { apiFetch } from '@lems/shared/fetch';
import { useEvent } from '../../../../components/event-context';
import { SendGridFormValues } from './form';
import { ContactRecord } from './upload-modal';

// CSV Parser utility
export const parseCSVContent = (csvContent: string): ContactRecord[] => {
  const lines = csvContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);
  if (lines.length < 2) return [];

  const contacts: ContactRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(part => part.trim());
    if (parts.length >= 3 && parts[2]) {
      contacts.push({
        teamNumber: parts[0] || 'N/A',
        region: parts[1] || 'N/A',
        email: parts[2]
      });
    }
  }
  return contacts;
};

// Encode/Decode Base64 utilities (browser-compatible)
export const encodeCSVToBase64 = (csvContent: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(csvContent)));
  } catch {
    return '';
  }
};

export const decodeBase64ToCSV = (base64: string): string => {
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return '';
  }
};

export interface SendGridContextType {
  formValues: SendGridFormValues;
  errors: Partial<SendGridFormValues>;
  csvError: string;
  csvSuccess: string;
  isTestingEmail: boolean;
  uploadedContacts: ContactRecord[];
  showUploadModal: boolean;
  uploadModalData: { successCount: number; errorCount: number; sampleContacts: ContactRecord[] };

  handleFieldChange: (field: keyof SendGridFormValues, value: string) => void;
  handleCSVUpload: (file: File) => Promise<void>;
  handleTestEmail: () => Promise<void>;
  handleReplaceContacts: () => void;
  handleCloseUploadModal: () => void;
}

const SendGridContext = createContext<SendGridContextType | undefined>(undefined);

interface SendGridProviderProps {
  children: ReactNode;
  settings: Record<string, unknown>;
  onSave: (settings: Record<string, unknown>) => void;
  showErrors?: boolean;
}

export const SendGridProvider: React.FC<SendGridProviderProps> = ({
  children,
  settings,
  onSave,
  showErrors = false
}) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const event = useEvent();

  const [formValues, setFormValues] = useState<SendGridFormValues>({
    templateId: '',
    fromAddress: '',
    testEmailAddress: ''
  });
  const [errors, setErrors] = useState<Partial<SendGridFormValues>>({});
  const [csvError, setCsvError] = useState<string>('');
  const [csvSuccess, setCsvSuccess] = useState<string>('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [uploadedContacts, setUploadedContacts] = useState<ContactRecord[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalData, setUploadModalData] = useState({
    successCount: 0,
    errorCount: 0,
    sampleContacts: [] as ContactRecord[]
  });

  // Initialize form state and decode previously uploaded contacts
  useEffect(() => {
    setFormValues({
      templateId: (settings.templateId as string) || '',
      fromAddress: (settings.fromAddress as string) || '',
      testEmailAddress: (settings.testEmailAddress as string) || ''
    });
    setErrors({});

    const emailContactsData = settings.emailContactsData as string | undefined;
    if (emailContactsData) {
      try {
        const csvContent = decodeBase64ToCSV(emailContactsData);
        const contacts = parseCSVContent(csvContent);
        setUploadedContacts(contacts);
      } catch {
        setUploadedContacts([]);
      }
    } else {
      setUploadedContacts([]);
    }
  }, [
    settings.templateId,
    settings.fromAddress,
    settings.testEmailAddress,
    settings.emailContactsData
  ]);

  // Validate and save when showErrors is true
  useEffect(() => {
    if (showErrors) {
      try {
        SendGridSettingsSchema.parse(formValues);
        setErrors({});
        onSave({ ...formValues });
      } catch (error) {
        if (error instanceof Error) {
          const message = error.message;
          setErrors({
            ...(message.includes('templateId') && {
              templateId: t('validation-template-id-required')
            }),
            ...(message.includes('fromAddress') && {
              fromAddress: t('validation-from-address-required')
            }),
            ...(message.includes('testEmailAddress') && {
              testEmailAddress: t('validation-test-email-required')
            })
          });
        }
      }
    }
  }, [showErrors, formValues, onSave, t]);

  const handleFieldChange = useCallback(
    (field: keyof SendGridFormValues, value: string) => {
      setFormValues(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    },
    [errors]
  );

  const handleCSVUpload = async (file: File) => {
    setCsvError('');
    setCsvSuccess('');

    if (!file.name.endsWith('.csv')) {
      setCsvError(t('csv-error-invalid-format'));
      return;
    }

    try {
      const csvContent = await file.text();
      const allContacts = parseCSVContent(csvContent);

      if (allContacts.length === 0) {
        setCsvError(t('csv-error-no-valid-emails'));
        return;
      }

      const result = await apiFetch(`/integrations/sendgrid/${event.id}/upload-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });

      if (!result.ok) {
        const error = result.error as string;
        setCsvError(error || t('csv-error-upload-failed'));
        return;
      }

      const successCount = (result.data as { count: number }).count;
      const errorCount = allContacts.length - successCount;

      const base64CSV = encodeCSVToBase64(csvContent);
      onSave({ ...formValues, emailContactsData: base64CSV });
      setUploadedContacts(allContacts);
      setUploadModalData({ successCount, errorCount, sampleContacts: allContacts.slice(0, 5) });
      setShowUploadModal(true);
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : t('csv-error-upload-failed'));
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      const { ok, response } = await apiFetch(`/integrations/sendgrid/${event.id}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      if (!ok) {
        const error = await response.json();
        setCsvError(error.error || t('csv-error-send-test-failed'));
        return;
      }

      setCsvSuccess(t('csv-success-test-email-sent', { email: formValues.testEmailAddress }));
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : t('csv-error-send-test-failed'));
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleReplaceContacts = () => {
    setCsvError('');
    setCsvSuccess('');
    setUploadedContacts([]);
    setShowUploadModal(false);
  };

  const handleCloseUploadModal = () => setShowUploadModal(false);

  return (
    <SendGridContext.Provider
      value={{
        formValues,
        errors,
        csvError,
        csvSuccess,
        isTestingEmail,
        uploadedContacts,
        showUploadModal,
        uploadModalData,
        handleFieldChange,
        handleCSVUpload,
        handleTestEmail,
        handleReplaceContacts,
        handleCloseUploadModal
      }}
    >
      {children}
    </SendGridContext.Provider>
  );
};

export const useSendGrid = (): SendGridContextType => {
  const context = useContext(SendGridContext);
  if (!context) throw new Error('useSendGrid must be used within SendGridProvider');
  return context;
};
