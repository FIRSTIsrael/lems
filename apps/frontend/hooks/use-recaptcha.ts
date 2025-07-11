import { useCallback, useEffect } from 'react';
import { loadScriptByURL } from '../lib/utils/scripts';

/**
 * Custom hook to load Google reCAPTCHA script and provide a function to remove the badge.
 * @param enforce - A boolean indicating whether to enforce loading the reCAPTCHA script.
 * If true, the script will be loaded; if false, it will not.
 * @returns A function to remove the reCAPTCHA badge.
 */
export const useRecaptcha = (enforce: boolean) => {
  useEffect(() => {
    if (enforce) {
      loadScriptByURL(
        'recaptcha-script',
        `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeBadge = useCallback(() => {
    document.getElementById('recaptcha-script')?.remove();
    document.querySelector('.grecaptcha-badge')?.remove();
  }, []);

  return removeBadge;
};
