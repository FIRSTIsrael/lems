/**
 * Validates if a slug is in the correct format
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Check if slug matches the pattern: lowercase letters, numbers, and dashes only
  // Must not start or end with a dash, and no consecutive dashes
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}
