'use client';

import { createContext, ReactNode, useState, useCallback, useContext } from 'react';
import { apiFetch } from '@lems/shared/fetch';
import { Contact } from './types';
import { decodeContactsFromBase64 } from './helpers';

interface SendGridContextType {
  contacts: Contact[];
  loading: boolean;
  deleteContact: (teamNumber: number) => Promise<void>;
  syncContacts: (contacts: Contact[]) => void;
}

export const SendGridContext = createContext<SendGridContextType | undefined>(undefined);

interface SendGridProviderProps {
  children: ReactNode;
  initialSettings?: Record<string, unknown>;
  eventId?: string;
}

export const SendGridProvider = ({
  children,
  initialSettings = {},
  eventId
}: SendGridProviderProps) => {
  const emailContactsData = (initialSettings.emailContactsData as string) || '';
  const initialContacts = decodeContactsFromBase64(emailContactsData);

  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [loading, setLoading] = useState(false);

  /**
   * Delete a single contact via API and update local state
   */
  const deleteContact = useCallback(
    async (teamNumber: number) => {
      if (!eventId) throw new Error('Event ID not available');

      try {
        setLoading(true);
        await apiFetch(`/integrations/sendgrid/${eventId}/contacts/${teamNumber}`, {
          method: 'DELETE'
        });

        // Update local state
        const updated = contacts.filter(c => c.team_number !== teamNumber);
        setContacts(updated);
      } finally {
        setLoading(false);
      }
    },
    [contacts, eventId]
  );

  /**
   * Sync contacts from backend (after upload or other changes)
   */
  const syncContacts = useCallback((newContacts: Contact[]) => {
    setContacts(newContacts);
  }, []);

  const value: SendGridContextType = {
    contacts,
    loading,
    deleteContact,
    syncContacts
  };

  return (
    <SendGridContext.Provider value={value}>
      {children}
    </SendGridContext.Provider>
  );
};

export function useSendGridContacts() {
  const context = useContext(SendGridContext);
  if (!context) {
    throw new Error('useSendGridContacts must be used within SendGridProvider');
  }
  return context;
}