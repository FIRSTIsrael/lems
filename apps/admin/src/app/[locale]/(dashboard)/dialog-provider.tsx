'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Dialog } from '@mui/material';

export interface DialogComponentProps {
  close: () => void;
}

export type DialogComponent<T = {}> = React.FC<DialogComponentProps & T>;

interface DialogContextType {
  showDialog: (component?: DialogComponent) => void;
  hideDialog: () => void;
  setDialogComponent: (component: DialogComponent | null) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [DialogContent, setDialogContent] = useState<DialogComponent | null>(null);

  const hideDialog = useCallback(() => {
    setIsOpen(false);
    // Reset dialog content after a small delay to allow for smooth close animation
    setTimeout(() => setDialogContent(null), 200);
  }, []);

  const showDialog = useCallback(
    (component?: DialogComponent) => {
      if (component) {
        setDialogContent(() => component); // Use function to ensure component is stored correctly
        setIsOpen(true);
      } else if (DialogContent) {
        // Only show if there's already a component set
        setIsOpen(true);
      } else {
        console.warn('Cannot show dialog: no component provided and no component previously set');
      }
    },
    [DialogContent]
  );

  const setDialogComponent = useCallback((component: DialogComponent | null) => {
    setDialogContent(() => component);
  }, []);

  const contextValue: DialogContextType = {
    showDialog,
    hideDialog,
    setDialogComponent
  };

  const renderDialogContent = () => {
    if (!DialogContent) return null;

    const dialogProps: DialogComponentProps = {
      close: hideDialog
    };

    try {
      return React.createElement(DialogContent, dialogProps);
    } catch (error) {
      throw new Error(
        `Error creating dialog component ${DialogContent.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <Dialog
        open={isOpen}
        onClose={hideDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {renderDialogContent()}
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }

  return context;
};
