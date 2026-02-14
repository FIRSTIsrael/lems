'use client';

import { useState } from 'react';
import { Typography, Button, Stack, Divider } from '@mui/material';
import { Add, AutoAwesome } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface PitMapControlsProps {
  pitMapData: any;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onUpdate: () => void;
  onStartDrawing: () => void;
}

export const PitMapControls: React.FC<PitMapControlsProps> = ({
  pitMapData,
  onError,
  onSuccess,
  onUpdate,
  onStartDrawing
}) => {
  const t = useTranslations('pages.events.pit-map');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddArea = () => {
    if (!pitMapData?.pitMap) {
      onError('Please upload a pit map image first');
      return;
    }
    onStartDrawing();
  };

  const handleGenerateAssignments = async () => {
    if (!pitMapData?.pitMap?.id) {
      onError('Please upload a pit map image first');
      return;
    }

    if (!pitMapData?.areas || pitMapData.areas.length === 0) {
      onError('Please add at least one area first');
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: Call the generate assignments API
      onSuccess('Team assignments generated successfully');
      onUpdate();
    } catch (err) {
      console.error('Error generating assignments:', err);
      onError('Failed to generate assignments');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">{t('controls.title')}</Typography>

      <Stack spacing={2}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddArea}
          fullWidth
          disabled={!pitMapData?.pitMap}
        >
          {t('controls.add-area')}
        </Button>

        <Divider />

        <Button
          variant="contained"
          startIcon={<AutoAwesome />}
          onClick={handleGenerateAssignments}
          fullWidth
          disabled={!pitMapData?.pitMap || isGenerating}
        >
          {isGenerating ? t('controls.generating') : t('controls.generate-assignments')}
        </Button>
      </Stack>

      {pitMapData?.assignments && pitMapData.assignments.length > 0 && (
        <Typography variant="body2" color="text.secondary">
          {t('controls.assignments-count', { count: pitMapData.assignments.length })}
        </Typography>
      )}
    </Stack>
  );
};
