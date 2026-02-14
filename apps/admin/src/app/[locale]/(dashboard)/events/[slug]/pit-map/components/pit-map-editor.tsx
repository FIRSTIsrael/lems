'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { Box, Paper, Alert } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { useEvent } from '../../components/event-context';
import { DivisionSelector } from '../../components/division-selector';
import { PitMapCanvasWithDrawing } from './pit-map-canvas-with-drawing';
import { PitMapControls } from './pit-map-controls';
import { PitMapAreaList } from './pit-map-area-list';
import { PitMapAreaDialog } from './pit-map-area-dialog';
import { apiFetch } from '@lems/shared';

interface Point {
  x: number;
  y: number;
}

export const PitMapEditor: React.FC = () => {
  const event = useEvent();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [pendingPolygon, setPendingPolygon] = useState<Point[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`, {
    suspense: true,
    fallbackData: []
  });

  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;
  const selectedDivision = divisions.find(d => d.id === selectedDivisionId);

  // Fetch pit map data for selected division
  const { data: pitMapData, mutate: mutatePitMap } = useSWR(
    selectedDivisionId ? `/admin/pit-maps/divisions/${selectedDivisionId}` : null,
    {
      suspense: false,
      fallbackData: null,
      shouldRetryOnError: false,
      onError: () => {
        // Suppress errors - 404 is expected when no pit map exists yet
      }
    }
  );

  const handleError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
    mutatePitMap();
  };

  const handleStartDrawing = () => {
    setIsDrawingMode(true);
  };

  const handleDrawingComplete = (points: Point[]) => {
    if (points.length < 3) {
      handleError('Area must have at least 3 points');
      return;
    }
    setPendingPolygon(points);
    setIsDialogOpen(true);
    setIsDrawingMode(false);
  };

  const handleCancelDrawing = () => {
    setIsDrawingMode(false);
    setPendingPolygon(null);
  };

  const handleSaveArea = async (data: {
    name: string;
    maxTeams: number;
    divisionId: string | null;
  }) => {
    if (!pendingPolygon) return;

    try {
      // First, ensure pit map exists
      const pitMapId = pitMapData?.pitMap?.id;

      if (!pitMapId) {
        handleError('Please upload a pit map image first');
        return;
      }

      // Create the area
      await apiFetch('/admin/pit-maps/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitMapId,
          name: data.name,
          coordinates: { points: pendingPolygon },
          maxTeams: data.maxTeams,
          divisionId: data.divisionId
        })
      });

      handleSuccess('Area created successfully');
      setPendingPolygon(null);
      mutatePitMap();
    } catch (error) {
      console.error('Error creating area:', error);
      handleError('Failed to create area');
    }
  };

  if (!selectedDivision) {
    return <Alert severity="info">No divisions found. Please create divisions first.</Alert>;
  }

  return (
    <Box>
      {divisions.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <DivisionSelector divisions={divisions} />
        </Box>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Left side - Canvas and Controls */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <PitMapCanvasWithDrawing
              pitMapData={pitMapData}
              onError={handleError}
              onSuccess={handleSuccess}
              isDrawingMode={isDrawingMode}
              onDrawingComplete={handleDrawingComplete}
              onCancelDrawing={handleCancelDrawing}
              divisionId={selectedDivisionId}
              onImageUploaded={mutatePitMap}
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <PitMapControls
              pitMapData={pitMapData}
              onError={handleError}
              onSuccess={handleSuccess}
              onUpdate={mutatePitMap}
              onStartDrawing={handleStartDrawing}
            />
          </Paper>
        </Box>

        {/* Right side - Area List */}
        <Box sx={{ width: { xs: '100%', lg: 400 } }}>
          <Paper sx={{ p: 3 }}>
            <PitMapAreaList
              division={selectedDivision}
              pitMapData={pitMapData}
              onError={handleError}
              onSuccess={handleSuccess}
              onUpdate={mutatePitMap}
            />
          </Paper>
        </Box>
      </Box>

      <PitMapAreaDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setPendingPolygon(null);
        }}
        onSave={handleSaveArea}
        divisions={divisions}
        selectedDivisionId={selectedDivisionId}
      />
    </Box>
  );
};
