'use client';

import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Typography, Alert, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';
import { getApiBase } from '@lems/shared';
import { useEvent } from '../../../components/event-context';
import { ConfigurationForm, PracticeTablesConfig } from './configuration-form';

interface PracticeTablesSectionProps {
  division: Division;
  onUpdate?: () => void;
}

export const PracticeTablesSection: React.FC<PracticeTablesSectionProps> = ({
  division,
  onUpdate
}) => {
  const t = useTranslations('pages.events.practice-tables');
  const event = useEvent();
  const settings = division.practiceTablesSettings;

  // Initialize config from division settings or defaults
  const [config, setConfig] = useState<PracticeTablesConfig>({
    tableCount: settings?.tableCount ?? 4,
    slotDuration: settings?.slotDurationMinutes ?? 15,
    startTime: settings
      ? dayjs(settings.startTime)
      : dayjs(event.startDate).hour(7).minute(0).second(0),
    endTime: settings
      ? dayjs(settings.endTime)
      : dayjs(event.startDate).hour(19).minute(0).second(0),
    blockedSlots: (settings?.blockedTimeSlots ?? []).map(slot => ({
      start: dayjs(slot.start),
      end: dayjs(slot.end),
      reason: slot.reason
    }))
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${getApiBase()}/admin/events/${event.id}/divisions/${division.id}/practice-tables`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tableCount: config.tableCount,
            slotDurationMinutes: config.slotDuration,
            startTime: config.startTime.toISOString(),
            endTime: config.endTime.toISOString(),
            blockedTimeSlots: config.blockedSlots.map(slot => ({
              start: slot.start.toISOString(),
              end: slot.end.toISOString(),
              reason: slot.reason
            }))
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
  }, [config, event.id, division.id, onUpdate, t]);

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
