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

export interface UploadResult {
  contacts: Contact[];
  errors: ContactError[];
  added: Contact[];
  updated: Contact[];
}
