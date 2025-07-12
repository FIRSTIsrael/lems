import { useEffect } from 'react';
import { loadScriptByURL } from '../lib/utils/scripts';

const waitForRecaptcha = () => new Promise<void>(grecaptcha.ready);

/**
 * Function to create a reCAPTCHA token.
 * @returns A promise that resolves to the reCAPTCHA token.
 */
export const createRecaptchaToken = () =>
  waitForRecaptcha().then(() =>
    grecaptcha.execute(`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`, { action: 'submit' })
  );

/**
 * Function to remove the reCAPTCHA badge from the page.
 */
export const removeRecaptchaBadge = () => {
  document.getElementById('recaptcha-script')?.remove();
  document.querySelector('.grecaptcha-badge')?.remove();
};

/**
 * Custom hook to load Google reCAPTCHA script and provide a function to remove the badge.
 * @param enforce - A boolean indicating whether to enforce loading the reCAPTCHA script.
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
};
