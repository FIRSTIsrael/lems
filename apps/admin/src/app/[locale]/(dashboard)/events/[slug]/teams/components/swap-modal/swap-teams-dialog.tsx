'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  useTheme
} from '@mui/material';
import { useTranslations } from 'next-intl';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import {
  Team as AdminTeam,
  TeamWithDivision,
  SwapTeamsRequest,
  ReplaceTeamRequest
} from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { TeamSelectionStep } from './team-selection-step';
import { PreviewStep } from './preview-step';

interface SwapTeamsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTeam: TeamWithDivision;
  eventId: string;
  eventName?: string;
  divisionsCount?: number;
}

export const SwapTeamsDialog = ({
  open,
  onClose,
  selectedTeam,
  eventId,
  eventName,
  divisionsCount = 1
}: SwapTeamsDialogProps) => {
  const t = useTranslations('pages.events.teams.edit-teams-dialog');
  const tPreview = useTranslations('pages.events.teams.edit-teams-preview-modal');
  const [searchQuery, setSearchQuery] = useState('');
  const [secondaryTeam, setSecondaryTeam] = useState<AdminTeam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0); // 0 = select teams, 1 = review

  const { data: allTeams = [], isLoading: teamsLoading } = useSWR<AdminTeam[]>(
    open ? `/admin/teams` : null
  );

  // Filter out the selected team
  const teams = allTeams.filter(team => team.id !== selectedTeam.id);

  const teamIdsToFetch = [selectedTeam?.id, secondaryTeam?.id].filter(Boolean).join(',');

  const { data: registrations = {} } = useSWR(
    open && teamIdsToFetch
      ? `/admin/events/${eventId}/teams/registrations?teamIds=${teamIdsToFetch}`
      : null
  );

  const selectedTeamEvents = selectedTeam ? registrations[selectedTeam.id] || [] : [];
  const secondaryTeamEvents = secondaryTeam ? registrations[secondaryTeam.id] || [] : [];

  // Secondary team must have division info and be in the same division as primary team for swap
  const isSwap =
    secondaryTeam &&
    'division' in secondaryTeam &&
    (secondaryTeam as TeamWithDivision).division.id === selectedTeam.division.id;
  const operationType = isSwap ? 'swap' : 'replace';

  const handleTeamSelect = (team: AdminTeam) => {
    setSecondaryTeam(team);
    setError(null);
    setActiveStep(1); // Move to preview step
  };

  const handleBackToSelection = () => {
    setActiveStep(0);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!secondaryTeam) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isSwap) {
        const secondaryTeamWithDivision = secondaryTeam as TeamWithDivision;
        const payload: SwapTeamsRequest = {
          team1Id: selectedTeam.id,
          team1DivisionId: selectedTeam.division.id,
          team2Id: secondaryTeam.id,
          team2DivisionId: secondaryTeamWithDivision.division.id
        };

        const result = await apiFetch(`/admin/events/${eventId}/teams/swap-teams`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' }
        });

        if (!result.ok) {
          setError(tPreview('error'));
          setIsLoading(false);
          return;
        }
      } else {
        const payload: ReplaceTeamRequest = {
          currentTeamId: selectedTeam.id,
          newTeamId: secondaryTeam.id,
          divisionId: selectedTeam.division.id
        };

        const result = await apiFetch(`/admin/events/${eventId}/teams/replace-team`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' }
        });

        if (!result.ok) {
          setError(tPreview('error'));
          setIsLoading(false);
          return;
        }
      }

      // Invalidate cache
      await mutate(`/admin/events/${eventId}/teams`);
      handleClose();
    } catch {
      setError(tPreview('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSecondaryTeam(null);
    setActiveStep(0);
    setError(null);
    onClose();
  };

  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: 'none'
        }
      }}
    >
      {/* Header with Icon */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}04)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start'
        }}
      >
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            background: `${theme.palette.primary.main}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 44,
            height: 44
          }}
        >
          {secondaryTeam ? (
            isSwap ? (
              <SwapHorizIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
            ) : (
              <ArrowRightIcon sx={{ color: 'warning.main', fontSize: '1.5rem' }} />
            )
          ) : (
            <ArrowRightIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          {eventName && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
            >
              {eventName}
            </Typography>
          )}
          <DialogTitle sx={{ p: 0, mb: 0.5 }}>
            {activeStep === 0
              ? t('title')
              : operationType === 'swap'
                ? tPreview('swap-teams')
                : tPreview('replace-team')}
          </DialogTitle>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {activeStep === 0
              ? t('search-placeholder')
              : operationType === 'swap'
                ? tPreview('swap-description', {
                    team1Number: selectedTeam.number,
                    team2Number: secondaryTeam!.number
                  })
                : tPreview('replace-description', {
                    currentTeamNumber: selectedTeam.number,
                    newTeamNumber: secondaryTeam!.number
                  })}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ pt: 3, height: '600px', overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Progress Stepper */}
          <Stepper activeStep={activeStep} sx={{ pb: 2 }}>
            <Step>
              <StepLabel>Select Teams</StepLabel>
            </Step>
            <Step>
              <StepLabel>Review & Confirm</StepLabel>
            </Step>
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1.5,
                animation: 'slideDown 0.3s ease-out'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Step Content */}
          {activeStep === 0 ? (
            <TeamSelectionStep
              teams={teams}
              teamsLoading={teamsLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTeam={selectedTeam}
              onTeamSelect={handleTeamSelect}
            />
          ) : secondaryTeam ? (
            <PreviewStep
              selectedTeam={selectedTeam}
              secondaryTeam={secondaryTeam}
              isSwap={isSwap || false}
              divisionsCount={divisionsCount}
              selectedTeamEvents={selectedTeamEvents}
              secondaryTeamEvents={secondaryTeamEvents}
            />
          ) : null}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={activeStep === 1 ? handleBackToSelection : handleClose}
          disabled={isLoading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {activeStep === 1 ? t('actions.back') : t('actions.cancel')}
        </Button>
        {activeStep === 1 && (
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 120
            }}
          >
            {isLoading ? tPreview('actions.confirming') : tPreview('actions.confirm')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
