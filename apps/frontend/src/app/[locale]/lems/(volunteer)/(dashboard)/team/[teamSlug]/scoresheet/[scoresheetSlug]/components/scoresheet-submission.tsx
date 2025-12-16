'use client';

import { useRef, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Paper, Stack, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useScoresheet } from '../scoresheet-context';
import { useEvent } from '../../../../../../components/event-context';
import { validateScoresheet } from '../scoresheet-validation';
import { SUBMIT_SCORESHEET_WITH_SIGNATURE_MUTATION } from '../graphql';
import { SignatureCanvas, type SignatureCanvasHandle } from './signature-canvas';
import { SignatureActions } from './signature-actions';

export const ScoresheetSubmission: React.FC = () => {
  const t = useTranslations('pages.scoresheet');
  const { scoresheet } = useScoresheet();
  const { currentDivision } = useEvent();
  const signatureRef = useRef<SignatureCanvasHandle>(null);
  const [isSigned, setIsSigned] = useState(!!scoresheet.data.signature);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitWithSignature] = useMutation(SUBMIT_SCORESHEET_WITH_SIGNATURE_MUTATION);

  const validation = useMemo(() => {
    return validateScoresheet(scoresheet.data);
  }, [scoresheet.data]);

  const isCompleteAndErrorFree = validation.isComplete;
  const isReadyForSubmission = isCompleteAndErrorFree && isSigned;

  const handleClearSignature = () => {
    setIsSigned(false);
    signatureRef.current?.clear();
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

      toast.success(t('scoresheet-submitted-successfully'));
    } catch (error) {
      console.error('Failed to submit scoresheet:', error);
      toast.error(t('error-failed-to-submit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            {t('add-signature')}
          </Typography>
          {!isSigned && (
            <Typography variant="caption" color="textSecondary" display="block" mb={2}>
              {t('signature-instructions')}
            </Typography>
          )}
        </Box>

        <SignatureCanvas
          ref={signatureRef}
          disabled={isSigned}
          height={isCompleteAndErrorFree ? 220 : 0}
        />

        <SignatureActions isSigned={isSigned} onClear={handleClearSignature} />

        <Button
          variant="contained"
          size="large"
          disabled={!isReadyForSubmission || isSubmitting}
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
