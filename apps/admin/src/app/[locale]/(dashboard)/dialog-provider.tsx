'use client';

import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Dialog } from '@mui/material';

interface DialogContextType {
  showDialog: () => void;
  hideDialog: () => void;
  setDialogComponent: (component: ReactNode) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [DialogContent, setDialogContent] = useState<ReactNode | null>(null);

  const showDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const hideDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setDialogComponent = useCallback((component: ReactNode) => {
    setDialogContent(component);
  }, []);

  const contextValue: DialogContextType = {
    showDialog,
    hideDialog,
    setDialogComponent
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <Dialog open={isOpen} onClose={hideDialog}>
        {DialogContent}
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
