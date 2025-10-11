import { Locales } from '@lems/localization';

/**
 * Utility for fetching translations. Must be used in getServerSideProps or getStaticProps.
 * @param locale - The locale to fetch messages for, e.g., 'en', 'he'.
 */
export const getMessages = async (locale?: string) => {
  if (!locale || !(locale in Locales)) {
    locale = 'he'; // Default to Hebrew if no valid locale is provided
  }

  const messages = (await import(`./${locale}.json`)).default;
  return messages;
};
