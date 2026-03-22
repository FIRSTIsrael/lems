import { Contact } from './types';

/**
 * Decode contacts from base64
 */
export function decodeContactsFromBase64(base64: string): Contact[] {
  try {
    if (!base64) return [];
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as Contact[];
  } catch {
    return [];
  }
}

/**
 * Encode contacts to base64
 */
export function encodeContactsToBase64(contacts: Contact[]): string {
  const json = JSON.stringify(contacts);
  return Buffer.from(json).toString('base64');
}

/**
 * Formats contacts for DataGrid display
 * Adds a unique id field for each row
 */
export function formatContactsForDataGrid(contacts: Contact[]): (Contact & { id: string })[] {
  return contacts.map((contact, index) => ({
    ...contact,
    id: `${contact.team_number}-${index}`
  }));
}
