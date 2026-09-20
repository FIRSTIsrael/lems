'use client';

import { useState, useCallback } from 'react';
import { Typography, Alert, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';
import { getApiBase } from '@lems/shared';
import { ConfigurationForm, PracticeTablesConfig } from './configuration-form';

interface PracticeTablesSectionProps {
  eventId: string;
  division: Division;
  onUpdate?: () => void;
}

export const PracticeTablesSection: React.FC<PracticeTablesSectionProps> = ({
  eventId,
  division,
  onUpdate
}) => {
  const t = useTranslations('pages.events.practice-tables');

  // Initialize config from division settings or defaults
  const [config, setConfig] = useState<PracticeTablesConfig>({
    tableCount: division.practiceTablesSettings?.tableCount ?? 4,
    slotDuration: division.practiceTablesSettings?.slotDurationMinutes ?? 15,
    startTime: division.practiceTablesSettings?.startTime ?? '07:00',
    endTime: division.practiceTablesSettings?.endTime ?? '19:00',
    blockedSlots: division.practiceTablesSettings?.blockedTimeSlots ?? []
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${getApiBase()}/admin/events/${eventId}/divisions/${division.id}/practice-tables`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tableCount: config.tableCount,
            slotDurationMinutes: config.slotDuration,
            startTime: config.startTime,
            endTime: config.endTime,
            blockedTimeSlots: config.blockedSlots
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      setMessage({ type: 'success', text: t('messages.save-success') });

      // Trigger parent to refetch divisions
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setMessage({ type: 'error', text: t('errors.save-failed') });
    } finally {
      setSaving(false);
    }
  }, [config, eventId, division.id, onUpdate, t]);

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        {t('title')}
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <ConfigurationForm config={config} onChange={setConfig} onSave={handleSave} saving={saving} />
    </Paper>
  );
};
