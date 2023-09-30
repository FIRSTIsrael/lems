export const withRecaptchaToken = (callback: (token: string) => void) => {
  grecaptcha.ready(() => {
    grecaptcha
      .execute(`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`, {
        action: 'submit'
      })
      .then(token => callback(token));
  });
};
