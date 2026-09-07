'use client';

import { useState, useEffect } from 'react';
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
  division: Division;
}

export const PracticeTablesSection: React.FC<PracticeTablesSectionProps> = ({ division }) => {
  const t = useTranslations('pages.events.practice-tables');

  const [tableCount, setTableCount] = useState(4);
  const [slotDuration, setSlotDuration] = useState(15);
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('19:00');
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load configuration when division changes
  useEffect(() => {
    const loadConfiguration = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${getApiBase()}/lems/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              query GetPracticeTablesConfig($divisionId: String!) {
                practiceTablesConfig(divisionId: $divisionId) {
                  divisionId
                  tableCount
                  slotDurationMinutes
                  startTime
                  endTime
                  blockedTimeSlots {
                    start
                    end
                    reason
                  }
                }
              }
            `,
            variables: { divisionId: division.id }
          })
        });

        const result = await response.json();

        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error(result.errors[0].message);
        }

        if (result.data?.practiceTablesConfig) {
          setTableCount(result.data.practiceTablesConfig.tableCount);
          setSlotDuration(result.data.practiceTablesConfig.slotDurationMinutes);
          setStartTime(result.data.practiceTablesConfig.startTime);
          setEndTime(result.data.practiceTablesConfig.endTime);
          setBlockedSlots(result.data.practiceTablesConfig.blockedTimeSlots || []);
        }
      } catch (error) {
        console.error('Failed to load configuration:', error);
        setMessage({ type: 'error', text: t('errors.load-failed') });
      } finally {
        setLoading(false);
      }
    };

    loadConfiguration();
  }, [division.id, t]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${getApiBase()}/lems/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            mutation UpdatePracticeTablesConfig($input: PracticeTablesConfigInput!) {
              updatePracticeTablesConfig(input: $input) {
                divisionId
                tableCount
                slotDurationMinutes
                startTime
                endTime
                blockedTimeSlots {
                  start
                  end
                  reason
                }
              }
            }
          `,
          variables: {
            input: {
              divisionId: division.id,
              tableCount,
              slotDurationMinutes: slotDuration,
              startTime,
              endTime,
              blockedTimeSlots: blockedSlots
            }
          }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setMessage({ type: 'success', text: t('messages.save-success') });
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
        loading={loading}
        showCancel={false}
      />
    </Paper>
  );
};
