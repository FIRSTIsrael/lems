import { useState } from 'react';

interface UseTitleEditReturn {
  isEditingTitle: boolean;
  editedTitle: string;
  setEditedTitle: (title: string) => void;
  openEdit: () => void;
  closeEdit: () => void;
  resetEdit: (originalTitle: string) => void;
}

export const useTitleEdit = (initialTitle: string): UseTitleEditReturn => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialTitle);

  const openEdit = () => {
    setIsEditingTitle(true);
  };

  const closeEdit = () => {
    setIsEditingTitle(false);
  };

  const resetEdit = (originalTitle: string) => {
    setEditedTitle(originalTitle);
    setIsEditingTitle(false);
  };

  return {
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    openEdit,
    closeEdit,
    resetEdit
  };
};
