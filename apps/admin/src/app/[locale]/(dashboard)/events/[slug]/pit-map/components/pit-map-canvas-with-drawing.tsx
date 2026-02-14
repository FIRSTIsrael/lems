'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Stack, Alert } from '@mui/material';
import { Upload, Close } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import useImage from 'use-image';

interface Point {
  x: number;
  y: number;
}

interface PitMapCanvasWithDrawingProps {
  pitMapData: any;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  isDrawingMode: boolean;
  onDrawingComplete: (points: Point[]) => void;
  onCancelDrawing: () => void;
  divisionId: string;
  onImageUploaded: () => void;
}

const PitMapImage = ({ src }: { src: string }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} />;
};

export const PitMapCanvasWithDrawing: React.FC<PitMapCanvasWithDrawingProps> = ({
  pitMapData,
  onError,
  onSuccess,
  isDrawingMode,
  onDrawingComplete,
  onCancelDrawing,
  divisionId,
  onImageUploaded
}) => {
  const t = useTranslations('pages.events.pit-map');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageUrl = uploadedImageUrl || pitMapData?.pitMap?.mapImageUrl || null;

  // Update stage size when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setStageSize({ width, height: 600 });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle keyboard events for drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDrawingMode) return;

      if (e.key === 'Enter' && currentPolygon.length >= 3) {
        onDrawingComplete(currentPolygon);
        setCurrentPolygon([]);
      } else if (e.key === 'Escape') {
        setCurrentPolygon([]);
        onCancelDrawing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawingMode, currentPolygon, onDrawingComplete, onCancelDrawing]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploading(true);

    try {
      // Create a local URL for immediate preview
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);

      // TODO: Upload image to object storage and get URL
      // For now, we'll use the local URL as a placeholder
      // In production, you would upload to DigitalOcean Spaces or similar
      const imageUrl = url;

      // Create pit map in database
      const { apiFetch } = await import('@lems/shared');
      await apiFetch('/admin/pit-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisionId,
          mapImageUrl: imageUrl
        })
      });

      onSuccess('Pit map created successfully');
      onImageUploaded();
    } catch (error) {
      console.error('Error uploading image:', error);
      onError('Failed to create pit map');
      setUploadedImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStageClick = (e: any) => {
    if (!isDrawingMode) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    setCurrentPolygon([...currentPolygon, { x: point.x, y: point.y }]);
  };

  const handleStageDblClick = () => {
    if (!isDrawingMode || currentPolygon.length < 3) return;

    onDrawingComplete(currentPolygon);
    setCurrentPolygon([]);
  };

  const handleCancelDrawing = () => {
    setCurrentPolygon([]);
    onCancelDrawing();
  };

  // Flatten points for Konva Line component
  const flattenedPoints = currentPolygon.flatMap(p => [p.x, p.y]);

  // Get existing areas from pitMapData
  const existingAreas = pitMapData?.areas || [];

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

      {isDrawingMode && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleCancelDrawing}
              startIcon={<Close />}
            >
              {t('canvas.cancel-drawing')}
            </Button>
          }
        >
          {t('canvas.drawing-mode')}
        </Alert>
      )}

      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: 400,
          border: '2px dashed',
          borderColor: isDrawingMode ? 'primary.main' : 'divider',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDrawingMode ? 'crosshair' : imageUrl ? 'default' : 'pointer',
          bgcolor: 'background.default',
          overflow: 'hidden'
        }}
        onClick={() => {
          if (!imageUrl && !isDrawingMode) {
            fileInputRef.current?.click();
          }
        }}
      >
        {imageUrl ? (
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onClick={handleStageClick}
            onDblClick={handleStageDblClick}
          >
            <Layer>
              <PitMapImage src={imageUrl} />

              {/* Draw existing areas */}
              {existingAreas.map((area: any) => {
                const points = area.coordinates?.points || [];
                const flatPoints = points.flatMap((p: Point) => [p.x, p.y]);
                return (
                  <Line
                    key={area.id}
                    points={flatPoints}
                    stroke="#2196f3"
                    strokeWidth={2}
                    closed
                    fill="rgba(33, 150, 243, 0.2)"
                  />
                );
              })}

              {/* Draw current polygon being created */}
              {currentPolygon.length > 0 && (
                <>
                  <Line points={flattenedPoints} stroke="#ff9800" strokeWidth={3} closed={false} />
                  {currentPolygon.map((point, i) => (
                    <Circle
                      key={i}
                      x={point.x}
                      y={point.y}
                      radius={5}
                      fill="#ff9800"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </>
              )}
            </Layer>
          </Stage>
        ) : (
          <Stack spacing={2} alignItems="center" sx={{ p: 4, textAlign: 'center' }}>
            <Upload sx={{ fontSize: 64, color: 'text.secondary' }} />
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
      </Box>

      {imageUrl && !isDrawingMode && (
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
