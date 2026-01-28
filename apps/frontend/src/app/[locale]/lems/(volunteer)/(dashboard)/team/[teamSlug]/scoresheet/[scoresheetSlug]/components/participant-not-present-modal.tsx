'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMutation as useApolloMutation } from '@apollo/client/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  CircularProgress
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { UPDATE_PARTICIPANT_STATUS } from '../../../../../referee/graphql/mutations';

interface ParticipantNotPresentModalProps {
  open: boolean;
  divisionId: string;
  matchId: string;
  participantId: string;
  teamNumber: number;
  onClose?: () => void;
}

export const ParticipantNotPresentModal = ({
  open,
  divisionId,
  matchId,
  participantId,
  teamNumber,
  onClose
}: ParticipantNotPresentModalProps) => {
  const t = useTranslations('layouts.scoresheet');
  const router = useRouter();
  const [isMarking, setIsMarking] = useState(false);

  const [updateParticipantStatus] = useApolloMutation(UPDATE_PARTICIPANT_STATUS);

  const handleGoBack = () => {
    router.back();
    onClose?.();
  };

  const handleMarkAsPresent = async () => {
    setIsMarking(true);
    try {
      await updateParticipantStatus({
        variables: {
          divisionId,
          matchId,
          participantId,
          present: true
        }
      });
      onClose?.();
    } catch (error) {
      console.error('Error marking participant as present:', error);
      setIsMarking(false);
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <WarningAmber color="warning" />
          <Typography variant="h6">{t('participant-not-present-title')}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography>{t('participant-not-present-message', { teamNumber })}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleGoBack} disabled={isMarking}>
          {t('go-back')}
        </Button>
        <Button
          onClick={handleMarkAsPresent}
          variant="contained"
          disabled={isMarking}
          startIcon={isMarking ? <CircularProgress size={16} /> : undefined}
        >
          {t('mark-as-present')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
