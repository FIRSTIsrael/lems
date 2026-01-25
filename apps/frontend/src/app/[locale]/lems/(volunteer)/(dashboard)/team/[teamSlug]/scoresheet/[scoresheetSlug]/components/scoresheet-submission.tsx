'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Paper, Stack, Box } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useScoresheet } from '../scoresheet-context';
import { useEvent } from '../../../../../../components/event-context';
import {
  SUBMIT_SCORESHEET_MUTATION,
  UPDATE_SCORESHEET_ESCALATED_MUTATION,
  RESET_SCORESHEET_MUTATION
} from '../graphql';
import { SignatureCanvas, type SignatureCanvasHandle } from './signature-canvas';
import { SignatureActions } from './signature-actions';
import { ScoresheetActionButtons } from './scoresheet-action-buttons';
import { ResetScoresheetDialog } from './reset-scoresheet-dialog';

export const ScoresheetSubmission: React.FC = () => {
  const t = useTranslations('pages.scoresheet');
  const { scoresheet, validation, setViewMode } = useScoresheet();
  const { currentDivision } = useEvent();

  const signatureRef = useRef<SignatureCanvasHandle>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);

  const [submitWithSignature] = useMutation(SUBMIT_SCORESHEET_MUTATION, {
    onError: error => {
      console.error('Failed to submit scoresheet:', error);
      toast.error(t('error-failed-to-submit'));
    }
  });

  const [updateEscalated] = useMutation(UPDATE_SCORESHEET_ESCALATED_MUTATION, {
    onError: error => {
      console.error('Failed to update escalation:', error);
      toast.error(t('error-failed-to-escalate'));
    }
  });

  const [resetScoresheet] = useMutation(RESET_SCORESHEET_MUTATION, {
    onError: error => {
      console.error('Failed to reset scoresheet:', error);
      toast.error(t('error-failed-to-reset'));
    }
  });

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setIsSigned(false);
  };

  const handleSignatureDrawn = () => {
    setIsSigned(true);
  };

  const handleSubmit = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error(t('error-signature-required'));
      return;
    }

    setIsLoading(true);

    try {
      const signature = signatureRef.current.getSignature();

      await submitWithSignature({
        variables: {
          divisionId: currentDivision.id,
          scoresheetId: scoresheet.id,
          signature
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async () => {
    setIsLoading(true);
    try {
      await updateEscalated({
        variables: {
          divisionId: currentDivision.id,
          scoresheetId: scoresheet.id,
          escalated: !scoresheet.escalated
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOpenResetDialog(true);
  };

  const handleConfirmReset = async () => {
    setOpenResetDialog(false);
    setIsLoading(true);
    try {
      await resetScoresheet({
        variables: {
          divisionId: currentDivision.id,
          scoresheetId: scoresheet.id
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
  };

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Stack spacing={3}>
        {scoresheet.data.signature ? (
          <Box
            sx={{
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 220,
              backgroundColor: 'background.paper'
            }}
          >
            <Image
              src={scoresheet.data.signature}
              alt="Saved signature"
              width={400}
              height={200}
              unoptimized
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
        ) : (
          <SignatureCanvas
            ref={signatureRef}
            disabled={!validation.isComplete}
            height={220}
            onPointerDown={handleSignatureDrawn}
          />
        )}

        <SignatureActions isSigned={isSigned} onClear={handleClearSignature} />

        <ScoresheetActionButtons
          isSigned={isSigned}
          isLoading={isLoading}
          onEscalate={handleEscalate}
          onReset={handleReset}
          onSubmit={handleSubmit}
          onSwitchToGP={() => setViewMode('gp')}
        />

        <ResetScoresheetDialog
          open={openResetDialog}
          onClose={handleCloseResetDialog}
          onConfirm={handleConfirmReset}
        />
      </Stack>
    </Paper>
  );
};
