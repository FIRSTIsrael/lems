'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Box, useTheme } from '@mui/material';
import SignaturePad from '@uiw/react-signature';

export interface SignatureCanvasHandle {
  clear: () => void;
  isEmpty: () => boolean;
  getSignature: () => string;
}

interface SignatureCanvasProps {
  disabled?: boolean;
  height?: number;
}

type SignaturePadInstance = {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
};

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  ({ disabled = false, height = 200 }, ref) => {
    const theme = useTheme();
    const signaturePadRef = useRef<SignaturePadInstance | null>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        signaturePadRef.current?.clear();
      },
      isEmpty: () => {
        return signaturePadRef.current?.isEmpty() ?? true;
      },
      getSignature: () => {
        return signaturePadRef.current?.toDataURL() ?? '';
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
          '&:hover': !disabled && {
            borderColor: theme.palette.primary.dark,
            boxShadow: theme.shadows[2]
          }
        }}
      >
        <SignaturePad
          ref={signaturePadRef}
          width={undefined}
          height={height}
          bgColor={disabled ? theme.palette.action.disabledBackground : '#ffffff'}
          penColor={theme.palette.primary.main}
          dotSize={2}
          minWidth={1}
          maxWidth={3}
          throttle={16}
          readonly={disabled}
          onEnd={() => {
            // Optional: you can add custom behavior here
          }}
        />
      </Box>
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';
