'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  IconButton,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Division } from '@lems/types/api/admin';
import { useEvent } from '../components/event-context';
import { DivisionSelector } from '../components/division-selector';
import { getApiBase } from '@lems/shared';

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

  // Auto-select first division when divisions load
  useEffect(() => {
    if (divisions.length > 0 && !selectedDivisionId) {
      setSelectedDivisionId(divisions[0].id);
    }
  }, [divisions, selectedDivisionId]);

  // Load configuration when division changes
  useEffect(() => {
    if (!selectedDivisionId) return;

    const loadConfig = async () => {
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
        setMessage({ type: 'error', text: 'Failed to load configuration' });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [selectedDivisionId]);

  const addBlockedSlot = () => {
    setBlockedSlots([...blockedSlots, { start: '12:00', end: '13:00', reason: '' }]);
  };

  const removeBlockedSlot = (index: number) => {
    setBlockedSlots(blockedSlots.filter((_, i) => i !== index));
  };

  const updateBlockedSlot = (index: number, field: keyof BlockedTimeSlot, value: string) => {
    const updated = [...blockedSlots];
    updated[index] = { ...updated[index], [field]: value };
    setBlockedSlots(updated);
  };

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
        console.error('GraphQL errors:', result.errors);
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

      {!loading && selectedDivisionId && !message && hasExistingConfig && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6">{t('status.title')}</Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('fields.table-count')}
                </Typography>
                <Typography variant="h5">{tableCount}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('fields.slot-duration')}
                </Typography>
                <Typography variant="h5">
                  {slotDuration} {t('fields.minutes')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('blocked-times.title')}
                </Typography>
                <Typography variant="h5">{blockedSlots.length}</Typography>
              </Grid>
            </Grid>

            {blockedSlots.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('blocked-times.details')}
                </Typography>
                <Stack spacing={1}>
                  {blockedSlots.map((slot, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">
                        <strong>
                          {slot.start} - {slot.end}
                        </strong>
                        {slot.reason && (
                          <>
                            <br />
                            {slot.reason}
                          </>
                        )}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            <Divider />

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setIsEditing(true)}>
                {t('actions.edit-config')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                  if (confirm(t('actions.confirm-delete'))) {
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
                  }
                }}
                disabled={saving}
              >
                {t('actions.delete-config')}
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}

      {!hasExistingConfig && !isEditing && selectedDivisionId && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('no-config.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('no-config.description')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setTableCount(4);
                setSlotDuration(15);
                setStartTime('07:00');
                setEndTime('19:00');
                setBlockedSlots([]);
                setIsEditing(true);
              }}
            >
              {t('no-config.create-button')}
            </Button>
          </Stack>
        </Paper>
      )}

      {(!hasExistingConfig || isEditing) && selectedDivisionId && (
        <Paper sx={{ p: 4 }}>
          <Stack spacing={4}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && isEditing && (
              <>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('fields.table-count')}
                      type="number"
                      value={tableCount}
                      onChange={e => setTableCount(parseInt(e.target.value) || 0)}
                      helperText={t('fields.table-count-helper')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('fields.slot-duration')}
                      type="number"
                      value={slotDuration}
                      onChange={e => setSlotDuration(parseInt(e.target.value) || 0)}
                      helperText={t('fields.slot-duration-helper')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('fields.start-time')}
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      helperText={t('fields.start-time-helper')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('fields.end-time')}
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      helperText={t('fields.end-time-helper')}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('blocked-times.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {t('blocked-times.description')}
                  </Typography>

                  <Stack spacing={3}>
                    {blockedSlots.map((slot, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                              label={t('blocked-times.start-time')}
                              type="time"
                              value={slot.start}
                              onChange={e => updateBlockedSlot(index, 'start', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                              label={t('blocked-times.end-time')}
                              type="time"
                              value={slot.end}
                              onChange={e => updateBlockedSlot(index, 'end', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 5 }}>
                            <TextField
                              label={t('blocked-times.reason')}
                              value={slot.reason || ''}
                              onChange={e => updateBlockedSlot(index, 'reason', e.target.value)}
                              placeholder={t('blocked-times.reason-placeholder')}
                              fullWidth
                            />
                          </Grid>
                          <Grid
                            size={{ xs: 12, sm: 1 }}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                          >
                            <IconButton
                              onClick={() => removeBlockedSlot(index)}
                              color="error"
                              size="large"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addBlockedSlot}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {t('blocked-times.add')}
                    </Button>
                  </Stack>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? t('actions.saving') : t('actions.save')}
                  </Button>
                  {hasExistingConfig && isEditing && (
                    <Button variant="outlined" onClick={() => setIsEditing(false)}>
                      {t('actions.cancel')}
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
