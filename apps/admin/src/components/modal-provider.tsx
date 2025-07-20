'use client';

import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Modal, Box, Fade, Backdrop } from '@mui/material';

interface ModalContextType {
  showModal: () => void;
  hideModal: () => void;
  setModalComponent: (component: ReactNode) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

interface ModalProviderProps {
  children: ReactNode;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  outline: 0,
  minWidth: 400,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto'
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);

  const showModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setModalComponent = useCallback((component: ReactNode) => {
    setModalContent(component);
  }, []);

  const contextValue: ModalContextType = {
    showModal,
    hideModal,
    setModalComponent
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <Modal
        open={isOpen}
        onClose={hideModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500
          }
        }}
      >
        <Fade in={isOpen}>
          <Box sx={modalStyle}>{modalContent}</Box>
        </Fade>
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
};
