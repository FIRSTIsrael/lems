'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Paper, Stack, Box, Button, CircularProgress } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useScoresheet } from '../scoresheet-context';
import { useEvent } from '../../../../../../components/event-context';
import { SUBMIT_SCORESHEET_MUTATION } from '../graphql';
import { SignatureCanvas, type SignatureCanvasHandle } from './signature-canvas';
import { SignatureActions } from './signature-actions';

export const ScoresheetSubmission: React.FC = () => {
  const t = useTranslations('pages.scoresheet');
  const { scoresheet, validation } = useScoresheet();
  const { currentDivision } = useEvent();

  const signatureRef = useRef<SignatureCanvasHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const [submitWithSignature] = useMutation(SUBMIT_SCORESHEET_MUTATION, {
    onError: error => {
      console.error('Failed to submit scoresheet:', error);
      toast.error(t('error-failed-to-submit'));
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

    setIsSubmitting(true);

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
      setIsSubmitting(false);
    }
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

        <Button
          variant="contained"
          size="large"
          disabled={!isSigned || isSubmitting}
          onClick={handleSubmit}
          sx={{
            mt: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            py: 1.5
          }}
        >
          {isSubmitting ? (
            <Stack direction="row" alignItems="center" gap={1}>
              <CircularProgress size={20} color="inherit" />
              {t('submitting')}
            </Stack>
          ) : (
            t('submit-scoresheet')
          )}
        </Button>
      </Stack>
    </Paper>
  );
};
