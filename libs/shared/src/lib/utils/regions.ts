/**
 * Converts an ISO 3166-1 alpha-2 region code to its corresponding flag emoji.
 *
 * The flag emoji is created by taking the two-letter country code and converting
 * each letter to its Unicode Regional Indicator counterpart in the range U+1F1E6 through U+1F1FF.
 *
 * @param regionCode - ISO 3166-1 alpha-2 region code (e.g., 'US', 'IL', 'GB')
 * @returns The flag emoji for the region, or the original code if invalid
 *
 * @example
 * getRegionFlag('US') // 🇺🇸
 * getRegionFlag('IL') // 🇮🇱
 * getRegionFlag('GB') // 🇬🇧
 */
export const getRegionFlag = (regionCode: string): string => {
  if (!regionCode || regionCode.length !== 2) {
    return regionCode;
  }

  const code = regionCode.toUpperCase();

  // Check if both characters are valid ASCII letters
  if (!/^[A-Z]{2}$/.test(code)) {
    return regionCode;
  }

  // Convert each letter to its Regional Indicator Unicode character
  // Regional Indicators are in the range U+1F1E6 (🇦) to U+1F1FF (🇿)
  // The offset from 'A' (ASCII 65) to Regional Indicator 'A' (U+1F1E6) is 0x1f1a5
  const flagOffset = 0x1f1a5;
  const codePoints = regionCode.split('').map(char => flagOffset + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};

/**
 * Gets the display text for a region (code + flag).
 *
 * @param regionCode - ISO 3166-1 alpha-2 region code
 * @returns Formatted string like "IL 🇮🇱" or "US 🇺🇸"
 *
 * @example
 * getRegionDisplay('IL') // "IL 🇮🇱"
 */
export const getRegionDisplay = (regionCode: string): string => {
  const flag = getRegionFlag(regionCode);
  return `${regionCode.toUpperCase()} ${flag}`;
};

/**
 * Converts an ISO 3166-1 alpha-2 region code to its corresponding flag emoji CDN URL.
 * Uses the emoji CDN service from https://emojicdn.elk.sh/
 *
 * @param regionCode - ISO 3166-1 alpha-2 region code (e.g., 'US', 'IL', 'GB')
 * @returns The CDN URL for the flag emoji, or empty string if invalid
 *
 * @example
 * getRegionFlagUrl('US') // https://emojicdn.elk.sh/%F0%9F%87%BA%F0%9F%87%B8
 * getRegionFlagUrl('IL') // https://emojicdn.elk.sh/%F0%9F%87%AE%F0%9F%87%B1
 */
export const getRegionFlagUrl = (regionCode: string): string => {
  const flagEmoji = getRegionFlag(regionCode);
  return `https://emojicdn.elk.sh/${flagEmoji}`;
};
