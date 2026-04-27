import fs from 'fs';
import crypto from 'crypto';

const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface TempFileEntry {
  filePath: string;
  fileName: string;
  createdAt: number;
}

const store = new Map<string, TempFileEntry>();

function purgeTtl(): void {
  const now = Date.now();
  for (const [token, entry] of store.entries()) {
    if (now - entry.createdAt > TTL_MS) {
      fs.unlink(entry.filePath, () => {});
      store.delete(token);
    }
  }
}

export function storeTempFile(filePath: string, fileName: string): string {
  purgeTtl();
  const token = crypto.randomUUID();
  store.set(token, { filePath, fileName, createdAt: Date.now() });
  return token;
}

export function consumeTempFile(token: string): TempFileEntry | null {
  purgeTtl();
  const entry = store.get(token) ?? null;
  if (entry) store.delete(token);
  return entry;
}
