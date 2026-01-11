/**
 * Converts hyphens to underscores in a string.
 * Useful for converting between database formats and GraphQL enums.
 *
 * @param str - The input string with hyphens
 * @returns The string with hyphens replaced by underscores
 *
 * @example
 * hyphensToUnderscores('innovation-project') // 'innovation_project'
 */
export function hyphensToUnderscores(str: string): string {
  return str.replace(/-/g, '_');
}

/**
 * Converts underscores to hyphens in a string.
 * Useful for converting from GraphQL enums back to database formats.
 *
 * @param str - The input string with underscores
 * @returns The string with underscores replaced by hyphens
 *
 * @example
 * underscoresToHyphens('innovation_project') // 'innovation-project'
 */
export function underscoresToHyphens(str: string): string {
  return str.replace(/_/g, '-');
}

/**
 * Converts a kebab-case string to camelCase.
 *
 * @param str - The input kebab-case string
 * @returns The string converted to camelCase
 *
 * @example
 * kebabCaseToCamelCase('innovation-project') // 'innovationProject'
 */
export function kebabCaseToCamelCase(str: string): string {
  return str.replace(/-./g, x => x[1].toUpperCase());
}
