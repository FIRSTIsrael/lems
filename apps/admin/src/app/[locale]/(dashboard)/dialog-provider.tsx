'use client';

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  cloneElement,
  isValidElement
} from 'react';
import { Dialog } from '@mui/material';

export interface DialogComponentProps {
  close: () => void;
}

export type DialogComponent<T = {}> = React.FC<DialogComponentProps & T>;

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
  const [DialogContent, setDialogContent] = useState<DialogComponent | null>(null);

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

  const renderDialogContent = useCallback(() => {
    if (!DialogContent) return null;

    if (isValidElement(DialogContent)) {
      return cloneElement(DialogContent, {
        close: hideDialog,
        ...(DialogContent.props as unknown)
      });
    }

    return DialogContent;
  }, [DialogContent, hideDialog]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <Dialog open={isOpen} onClose={hideDialog}>
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
