'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Box, useTheme } from '@mui/material';
import SignaturePad, { type SignatureRef } from '@uiw/react-signature';

export interface SignatureCanvasHandle {
  clear: () => void;
  isEmpty: () => boolean;
  getSignature: () => string;
}

interface SignatureCanvasProps {
  disabled?: boolean;
  height?: number;
  onPointerDown?: () => void;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  ({ disabled = false, height = 200, onPointerDown }, ref) => {
    const theme = useTheme();
    const signaturePadRef = useRef<SignatureRef>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        signaturePadRef.current?.clear();
      },
      isEmpty: () => {
        return !signaturePadRef.current?.svg;
      },
      getSignature: () => {
        const svgElement = signaturePadRef.current?.svg;
        if (!svgElement) return '';
        
        const svgString = new XMLSerializer().serializeToString(svgElement);
        return `data:image/svg+xml;base64,${btoa(svgString)}`;
      }
    }));

    return (
      <Box
        sx={{
          border: `2px solid ${disabled ? theme.palette.divider : theme.palette.primary.main}`,
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: disabled ? theme.palette.action.disabledBackground : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'crosshair',
          transition: 'all 0.2s ease-in-out',
          '&:hover': disabled
            ? undefined
            : {
                borderColor: theme.palette.primary.dark,
                boxShadow: theme.shadows[2]
              }
        }}
      >
        <SignaturePad
          ref={signaturePadRef}
          height={height}
          readonly={disabled}
          onPointer={points => {
            if (points.length > 0 && onPointerDown) {
              onPointerDown();
            }
          }}
          options={{
            size: 3,
            thinning: 0.7,
            smoothing: 0.5,
            streamline: 0.5,
            simulatePressure: true
          }}
        />
      </Box>
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';
