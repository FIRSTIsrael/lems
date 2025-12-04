'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-hot-toast';
import { useRubric } from '../rubric-context';
import { UPDATE_RUBRIC_STATUS_MUTATION } from '../rubric.graphql';
import { useUser } from '../../../../../../../components/user-context';

interface SubmitRubricButtonProps {
  disabled?: boolean;
}

export const SubmitRubricButton: React.FC<SubmitRubricButtonProps> = ({ disabled = false }) => {
  const t = useTranslations('pages.rubric');
  const { rubric, validation } = useRubric();
  const router = useRouter();
  const user = useUser();

  const isDisabled = disabled || rubric.status !== 'draft' || !validation.isValid;

  const [submitRubricMutation] = useMutation(UPDATE_RUBRIC_STATUS_MUTATION, {
    onError: () => {
      toast.error(t('errors.submit'));
    }
  });

  const handleSubmit = useCallback(() => {
    submitRubricMutation({
      variables: {
        rubricId: rubric.id,
        status: 'locked'
      }
    });
    router.push(`/lems/${user.role}`);
  }, [router, rubric.id, submitRubricMutation, user.role]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mt: 3,
        mb: 2
      }}
    >
      <Button
        variant="contained"
        color="primary"
        size="large"
        disabled={isDisabled}
        onClick={handleSubmit}
        startIcon={<CheckCircleIcon />}
        sx={{
          minWidth: 200,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {t('actions.submit-rubric')}
      </Button>
    </Box>
  );
};
