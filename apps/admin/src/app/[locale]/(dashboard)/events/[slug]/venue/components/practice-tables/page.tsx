'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Division } from '@lems/types/api/admin';
import { getApiBase } from '@lems/shared';
import { useEvent } from '../components/event-context';
import { DivisionSelector } from '../components/division-selector';
import { ConfigurationSummary } from './components/configuration-summary';
import { ConfigurationForm } from './components/configuration-form';
import { NoConfiguration } from './components/no-configuration';

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

export default function PracticeTablesConfigPage() {
  const t = useTranslations('pages.events.practice-tables');
  const event = useEvent();
  const searchParams = useSearchParams();

  const [tableCount, setTableCount] = useState(4);
  const [slotDuration, setSlotDuration] = useState(15);
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('19:00');
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch divisions
  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`, {
    suspense: false,
    fallbackData: []
  });

  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;

  // Load configuration when division changes
  useEffect(() => {
    if (!selectedDivisionId) return;

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
            variables: { divisionId: selectedDivisionId }
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
          setHasExistingConfig(true);
          setIsEditing(false);
        } else {
          // No config exists
          setHasExistingConfig(false);
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Failed to load configuration:', error);
        setMessage({ type: 'error', text: t('errors.load-failed') });
      } finally {
        setLoading(false);
      }
    };

    loadConfiguration();
  }, [selectedDivisionId, t]);

  const handleSave = async () => {
    if (!selectedDivisionId) {
      setMessage({ type: 'error', text: t('errors.select-division') });
      return;
    }

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
              divisionId: selectedDivisionId,
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

      setHasExistingConfig(true);
      setIsEditing(false);
      setMessage({ type: 'success', text: t('messages.save-success') });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setMessage({ type: 'error', text: t('errors.save-failed') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('actions.confirm-delete'))) return;

    try {
      setSaving(true);
      const response = await fetch(`${getApiBase()}/lems/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            mutation DeletePracticeTablesConfig($divisionId: String!) {
              deletePracticeTablesConfig(divisionId: $divisionId)
            }
          `,
          variables: { divisionId: selectedDivisionId }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setHasExistingConfig(false);
      setIsEditing(false);
      setMessage({ type: 'success', text: t('status.deleted') });
    } catch (error) {
      console.error('Failed to delete configuration:', error);
      setMessage({ type: 'error', text: t('errors.delete-failed') });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateConfig = () => {
    setTableCount(4);
    setSlotDuration(15);
    setStartTime('07:00');
    setEndTime('19:00');
    setBlockedSlots([]);
    setIsEditing(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('description')}
      </Typography>

      {divisions.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <DivisionSelector divisions={divisions} />
        </Box>
      )}

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {!hasExistingConfig && !isEditing && selectedDivisionId && (
        <NoConfiguration onCreateConfig={handleCreateConfig} />
      )}

      {hasExistingConfig && !isEditing && (
        <ConfigurationSummary
          tableCount={tableCount}
          slotDuration={slotDuration}
          startTime={startTime}
          endTime={endTime}
          blockedSlots={blockedSlots}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          deleting={saving}
        />
      )}

      {isEditing && selectedDivisionId && (
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
          onCancel={hasExistingConfig ? () => setIsEditing(false) : undefined}
          saving={saving}
          loading={loading}
          showCancel={hasExistingConfig}
        />
      )}
    </Box>
  );
}
