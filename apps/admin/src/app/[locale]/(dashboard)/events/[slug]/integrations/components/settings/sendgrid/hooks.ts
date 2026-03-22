'use client';

import { useContext } from 'react';
import { SendGridContext } from './context';

export function useSendGridContacts() {
  const context = useContext(SendGridContext);
  if (!context) {
    throw new Error('useSendGridContacts must be used within SendGridProvider');
  }
  return context;
}
