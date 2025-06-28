/**
 * Utility for fetching translations. Must be used in getServerSideProps or getStaticProps.
 * @param locale - The locale to fetch messages for, e.g., 'en', 'he'.
 */
export const getMessages = async (locale?: string) => {
  const supportedLocales = ['en', 'he'];
  if (!locale || !supportedLocales.includes(locale)) {
    locale = 'he'; // Default to Hebrew if no valid locale is provided
  }

  const messages = (await import(`../locale/${locale}.json`)).default;
  return messages;
};
