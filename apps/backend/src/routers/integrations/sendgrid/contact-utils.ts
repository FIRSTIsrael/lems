import { z } from 'zod';
import { CSVRecord } from './types';

export interface Contact {
  team_number: number;
  region: string;
  recipient_email: string;
}

export interface ContactError {
  rowIndex: number;
  field: keyof Contact;
  message: string;
}

export const decodeContacts = (base64: string): Contact[] => {
  try {
    if (!base64) return [];
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as Contact[];
  } catch {
    return [];
  }
};

export const encodeContacts = (contacts: Contact[]): string => {
  const json = JSON.stringify(contacts);
  return Buffer.from(json).toString('base64');
};

/**
 * Merge new contacts with existing, tracking added vs updated
 */
export const mergeContacts = (
  existing: Contact[],
  incoming: Contact[]
): { merged: Contact[]; added: Contact[]; updated: Contact[] } => {
  const existingMap = new Map(existing.map(c => [c.team_number, c]));
  const added: Contact[] = [];
  const updated: Contact[] = [];
  const merged = existing.slice();

  incoming.forEach(incomingContact => {
    if (existingMap.has(incomingContact.team_number)) {
      const index = merged.findIndex(c => c.team_number === incomingContact.team_number);
      if (index >= 0) {
        merged[index] = incomingContact;
      }
      updated.push(incomingContact);
    } else {
      merged.push(incomingContact);
      added.push(incomingContact);
    }
  });

  return { merged, added, updated };
};

/**
 * Validate a single contact record
 */
export const validateContact = (record: CSVRecord, rowIndex: number): Contact | ContactError => {
  const teamNumber = parseInt(String(record.team_number || ''), 10);
  const region = String(record.region || '').trim();
  const email = String(record.recipient_email || '').trim();

  if (isNaN(teamNumber) || teamNumber <= 0) {
    return {
      rowIndex,
      field: 'team_number',
      message: 'Team number must be a positive integer'
    };
  }

  if (!region) {
    return {
      rowIndex,
      field: 'region',
      message: 'Region is required'
    };
  }

  if (!email) {
    return {
      rowIndex,
      field: 'recipient_email',
      message: 'Email address is required'
    };
  }

  if (!z.email().safeParse(email).success) {
    return {
      rowIndex,
      field: 'recipient_email',
      message: 'Invalid email address format'
    };
  }

  return {
    team_number: teamNumber,
    region,
    recipient_email: email
  };
};
