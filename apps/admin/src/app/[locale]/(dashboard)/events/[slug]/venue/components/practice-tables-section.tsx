'use client';

import { useState } from 'react';
import { Typography, Alert, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';
import { getApiBase } from '@lems/shared';
import { ConfigurationForm } from './practice-tables/components/configuration-form';

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

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

  // Initialize state from division settings or defaults
  const [tableCount, setTableCount] = useState(division.practiceTablesSettings?.tableCount ?? 4);
  const [slotDuration, setSlotDuration] = useState(
    division.practiceTablesSettings?.slotDurationMinutes ?? 15
  );
  const [startTime, setStartTime] = useState(division.practiceTablesSettings?.startTime ?? '07:00');
  const [endTime, setEndTime] = useState(division.practiceTablesSettings?.endTime ?? '19:00');
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>(
    division.practiceTablesSettings?.blockedTimeSlots ?? []
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
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
            tableCount,
            slotDurationMinutes: slotDuration,
            startTime,
            endTime,
            blockedTimeSlots: blockedSlots
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
  };

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

      <ConfigurationForm
        tableCount={tableCount}
        slotDuration={slotDuration}
        startTime={startTime}
        endTime={endTime}
        blockedSlots={blockedSlots}
        onTableCountChange={setTableCount}
        onSlotDurationChange={setSlotDuration}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        onBlockedSlotsChange={setBlockedSlots}
        onSave={handleSave}
        saving={saving}
      />
    </Paper>
  );
};
