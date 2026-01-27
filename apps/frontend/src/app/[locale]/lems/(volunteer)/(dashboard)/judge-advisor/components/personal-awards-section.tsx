'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
  Paper,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { useAwardTranslations } from '@lems/localization';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import toast from 'react-hot-toast';
import { ASSIGN_PERSONAL_AWARD } from '../graphql/mutations/assign-personal-award';
import { useEvent } from '../../../components/event-context';
import type { Award } from '../graphql/types';
import { useJudgeAdvisor } from './judge-advisor-context';
import { AssignAwardConfirmationDialog } from './personal-awards/assign-award-confirmation-dialog';

export function PersonalAwardsSection() {
  const t = useTranslations('pages.judge-advisor.awards.personal-awards');
  const { getName, getDescription } = useAwardTranslations();
  const { awards, loading } = useJudgeAdvisor();
  const { currentDivision } = useEvent();
  const theme = useTheme();

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    award: Award | null;
    winnerName: string;
  }>({
    open: false,
    award: null,
    winnerName: ''
  });

  // Local input state for unassigned awards
  const [awardInputs, setAwardInputs] = useState<Record<string, string>>({});

  // Mutation setup
  const [assignPersonalAward, { loading: mutationLoading, error: mutationError }] =
    useMutation(ASSIGN_PERSONAL_AWARD);

  // Filter personal awards
  const personalAwards = useMemo(() => {
    return awards.filter(award => award.type === 'PERSONAL').sort((a, b) => a.index - b.index);
  }, [awards]);

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (mutationError) {
      const timer = setTimeout(() => {
        // Error will be shown as a toast instead
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mutationError]);

  const handleAwardInputChange = useCallback((awardId: string, value: string) => {
    // Enforce max length of 64 characters
    const truncated = value.slice(0, 64);
    setAwardInputs(prev => ({
      ...prev,
      [awardId]: truncated
    }));
  }, []);

  const handleAssignClick = useCallback(
    (award: Award) => {
      const winnerName = awardInputs[award.id]?.trim() || '';
      if (!winnerName) {
        toast.error(t('error-empty-winner-name'));
        return;
      }

      setConfirmDialog({
        open: true,
        award,
        winnerName
      });
    },
    [awardInputs, t]
  );

  const handleConfirmAssign = useCallback(async () => {
    if (!confirmDialog.award) return;

    try {
      await assignPersonalAward({
        variables: {
          awardId: confirmDialog.award.id,
          winnerName: confirmDialog.winnerName,
          divisionId: currentDivision.id
        }
      });

      // Clear the input for this award
      setAwardInputs(prev => ({
        ...prev,
        [confirmDialog.award!.id]: ''
      }));

      // Close dialog
      setConfirmDialog({
        open: false,
        award: null,
        winnerName: ''
      });

      toast.success(t('award-assigned-success'));
    } catch (error) {
      console.error('Error assigning personal award:', error);
      const errorMessage = error instanceof Error ? error.message : t('error-assigning-award');
      toast.error(errorMessage);
    }
  }, [confirmDialog, assignPersonalAward, currentDivision.id, t]);

  const handleCancelAssign = useCallback(() => {
    setConfirmDialog({
      open: false,
      award: null,
      winnerName: ''
    });
  }, []);

  if (personalAwards.length === 0) {
    return (
      <Card>
        <CardHeader
          title={t('title')}
          slotProps={{ title: { variant: 'h6' } }}
          avatar={<EmojiEventsIcon sx={{ color: 'primary.main' }} />}
        />
        <CardContent>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              borderLeft: `4px solid ${theme.palette.info.main}`
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('no-awards')}
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('title')}
        slotProps={{ title: { variant: 'h6' } }}
        avatar={<EmojiEventsIcon sx={{ color: 'primary.main' }} />}
      />
      <CardContent>
        <Stack spacing={3}>
          {mutationError && (
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              onClose={() => {
                // Error will be cleared on next successful mutation or dialog close
              }}
            >
              {typeof mutationError.message === 'string'
                ? mutationError.message
                : t('error-assigning-award')}
            </Alert>
          )}

          <Grid container spacing={2}>
            {personalAwards.map(award => {
              const isAssigned = !!award.winner;
              const assignedWinner =
                award.winner && 'name' in award.winner ? award.winner.name : null;

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={award.id}>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <EmojiEventsIcon
                        sx={{
                          fontSize: 20,
                          color: 'primary.main',
                          mt: 0.25
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {getName(award.name)}
                        </Typography>
                        {award.isOptional && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.25 }}
                          >
                            ({t('optional')})
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ mb: 1.5 }}>{getDescription(award.name)}</Box>

                    {isAssigned ? (
                      // Assigned award: show winner name as text
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1.5,
                          p: 1.5,
                          backgroundColor: alpha(theme.palette.success.main, 0.05),
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 18,
                            color: 'success.main',
                            flexShrink: 0
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {assignedWinner}
                        </Typography>
                      </Box>
                    ) : (
                      // Unassigned award: show input field and button on same line
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
                        <TextField
                          fullWidth
                          size="medium"
                          placeholder={t('winner-name-placeholder')}
                          value={awardInputs[award.id] ?? ''}
                          onChange={e => handleAwardInputChange(award.id, e.target.value)}
                          disabled={loading || mutationLoading}
                          variant="outlined"
                          inputProps={{
                            maxLength: 64
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'background.paper'
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          size="medium"
                          onClick={() => handleAssignClick(award)}
                          disabled={loading || mutationLoading || !awardInputs[award.id]?.trim()}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            flexShrink: 0,
                            minWidth: 'fit-content',
                            px: 3
                          }}
                        >
                          {mutationLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                          {t('assign-button')}
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </CardContent>

      {/* Confirmation Dialog */}
      <AssignAwardConfirmationDialog
        open={confirmDialog.open}
        awardName={confirmDialog.award?.name ?? null}
        winnerName={confirmDialog.winnerName}
        loading={mutationLoading}
        onConfirm={handleConfirmAssign}
        onCancel={handleCancelAssign}
      />
    </Card>
  );
}
