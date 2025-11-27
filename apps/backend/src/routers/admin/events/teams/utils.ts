export function isTeamsRegistration(data: unknown): data is Record<string, string[]> {
  if (typeof data !== 'object' || data === null) return false;

  return Object.entries(data).every(
    ([key, value]) =>
      typeof key === 'string' &&
      Array.isArray(value) &&
      value.every(item => typeof item === 'string')
  );
}
