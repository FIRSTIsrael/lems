'use client';

import { useEffect } from 'react';

// Type definition for Google reCAPTCHA v3
interface ReCaptchaV3 {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare const grecaptcha: ReCaptchaV3;

const waitForRecaptcha = () => new Promise<void>(resolve => grecaptcha.ready(resolve));

/**
 * Function to load the Google reCAPTCHA script by URL.
 * @param elementId - The ID of the script element.
 * @param url - The URL of the reCAPTCHA script.
 * @param callback - Optional callback function to execute after the script is loaded.
 */
const loadScriptByURL = (elementId: string, url: string, callback?: () => void) => {
  const isScriptExist = document.getElementById(elementId);

  if (!isScriptExist) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.id = elementId;
    script.onload = function () {
      if (callback) callback();
    };
    document.body.appendChild(script);
  }

  if (isScriptExist && callback) callback();
};

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
 * Requires an environment variable `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
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
