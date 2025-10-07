import enMessages from './en.json';
import heMessages from './he.json';

export const messages = {
  en: enMessages,
  he: heMessages
} as const;

export type LocaleMessages = typeof enMessages;
