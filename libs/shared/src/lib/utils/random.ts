/**
 * Generates a random alphanumeric string of the specified length.
 * @param length - The desired length of the random string
 * @returns A random string containing uppercase letters, lowercase letters, and digits
 */
export function randomAlphanumericString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
