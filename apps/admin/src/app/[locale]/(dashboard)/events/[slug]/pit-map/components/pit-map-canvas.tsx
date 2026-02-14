'use client';

import { useState, useRef } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Upload, Image as ImageIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface PitMapCanvasProps {
  pitMapData: any;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export const PitMapCanvas: React.FC<PitMapCanvasProps> = ({ pitMapData, onError, onSuccess }) => {
  const t = useTranslations('pages.events.pit-map');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive imageUrl from pitMapData or uploaded image
  const imageUrl = uploadedImageUrl || pitMapData?.pitMap?.mapImageUrl || null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      onError('File size must not exceed 10 MB');
      return;
    }

    // Create a local URL for preview
    const url = URL.createObjectURL(file);
    setUploadedImageUrl(url);

    // TODO: Upload to server and create pit map
    // For now, just show the image
    onSuccess('Image loaded. Upload functionality coming soon.');
  };

  const handleCanvasClick = () => {
    if (!imageUrl) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('canvas.title')}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: 400,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: imageUrl ? 'default' : 'pointer',
          bgcolor: 'background.default',
          overflow: 'hidden'
        }}
        onClick={handleCanvasClick}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Pit map"
            style={{
              maxWidth: '100%',
              maxHeight: '600px',
              objectFit: 'contain'
            }}
          />
        ) : (
          <Stack spacing={2} alignItems="center" sx={{ p: 4, textAlign: 'center' }}>
            <ImageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              {t('canvas.no-image')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('canvas.upload-hint')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={e => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              {t('canvas.upload-button')}
            </Button>
          </Stack>
        )}

        {imageUrl && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          />
        )}
      </Box>

      {imageUrl && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('canvas.change-image')}
          </Button>
        </Stack>
      )}
    </Box>
  );
};
