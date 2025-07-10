import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const SALT_ROUNDS = 12;

export interface HashedPassword {
  hash: string;
  salt: string;
}

export async function hashPassword(password: string): Promise<HashedPassword> {
  const salt = randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(password + salt, SALT_ROUNDS);
  return { hash, salt };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  return bcrypt.compare(password + storedSalt, storedHash);
}

export function validatePassword(password: string): { isValid: boolean; error: string | null } {
  if (password.length < 8) {
    return { isValid: false, error: 'password-too-short' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'password-too-long' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'password-must-contain-lowercase' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'password-must-contain-uppercase' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'password-must-contain-number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'password-must-contain-special-character' };
  }

  return { isValid: true, error: null };
}

export function validateUsername(username: string): { isValid: boolean; error: string | null } {
  if (username.length < 3) {
    return { isValid: false, error: 'username-too-short' };
  }

  if (username.length > 32) {
    return { isValid: false, error: 'username-too-long' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'username-invalid-characters' };
  }

  return { isValid: true, error: null };
}
